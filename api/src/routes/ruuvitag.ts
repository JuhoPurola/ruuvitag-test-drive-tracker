/**
 * RuuviTag Data Routes
 * Handles sensor data and location submissions
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { io } from '../index';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/ruuvitag/location
 * Submit GPS location data
 */
router.post('/location', async (req: Request, res: Response): Promise<void> => {
  try {
    const { testDriveId, latitude, longitude, altitude, speed, heading, accuracy } = req.body;

    if (!testDriveId || latitude === undefined || longitude === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: testDriveId, latitude, longitude',
      });
      return;
    }

    const location = await prisma.location.create({
      data: {
        id: uuidv4(),
        testDriveId,
        latitude,
        longitude,
        altitude,
        speed,
        heading,
        accuracy,
      },
    });

    // Emit real-time update via WebSocket
    io.emit('location:update', {
      testDriveId,
      location,
    });

    res.status(201).json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error('Error saving location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save location',
    });
  }
});

/**
 * POST /api/ruuvitag/sensor
 * Submit sensor data (temperature, humidity, pressure, etc.)
 */
router.post('/sensor', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      testDriveId,
      temperature,
      humidity,
      pressure,
      accelerationX,
      accelerationY,
      accelerationZ,
      battery,
      rssi,
    } = req.body;

    if (!testDriveId || temperature === undefined || humidity === undefined || pressure === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: testDriveId, temperature, humidity, pressure',
      });
      return;
    }

    const sensorData = await prisma.sensorData.create({
      data: {
        id: uuidv4(),
        testDriveId,
        temperature,
        humidity,
        pressure,
        accelerationX,
        accelerationY,
        accelerationZ,
        battery,
        rssi,
      },
    });

    // Analyze driving behavior if acceleration data is present
    if (accelerationX !== undefined && accelerationY !== undefined && accelerationZ !== undefined) {
      // Get previous sensor reading to detect changes
      const previousSensor = await prisma.sensorData.findFirst({
        where: { testDriveId },
        orderBy: { timestamp: 'desc' },
        skip: 1, // Skip the one we just created
      });

      let hardAccelerationInc = 0;
      let hardBrakingInc = 0;
      let aggressiveTurnInc = 0;

      // Detect hard acceleration and braking (X-axis change)
      if (previousSensor && previousSensor.accelerationX !== null) {
        const accelChange = accelerationX - previousSensor.accelerationX;
        if (accelChange > 0.3) {
          hardAccelerationInc = 1;
        } else if (accelChange < -0.3) {
          hardBrakingInc = 1;
        }
      }

      // Detect aggressive turns (high Y-axis acceleration)
      if (Math.abs(accelerationY) > 0.4) {
        aggressiveTurnInc = 1;
      }

      // Update test drive statistics
      const testDrive = await prisma.testDrive.update({
        where: { id: testDriveId },
        data: {
          hardAccelerations: { increment: hardAccelerationInc },
          hardBraking: { increment: hardBrakingInc },
          aggressiveTurns: { increment: aggressiveTurnInc },
          totalSensorReadings: { increment: 1 },
        },
      });

      // Calculate and update driving score
      const totalEvents = testDrive.hardAccelerations + testDrive.hardBraking + testDrive.aggressiveTurns;
      const aggressiveRate = totalEvents / testDrive.totalSensorReadings;
      const drivingScore = Math.max(0, Math.round(100 - (aggressiveRate * 100)));

      await prisma.testDrive.update({
        where: { id: testDriveId },
        data: { drivingScore },
      });
    }

    // Check for battery alerts
    if (battery < 20) {
      await prisma.alert.create({
        data: {
          id: uuidv4(),
          testDriveId,
          type: 'battery',
          message: `Low battery: ${battery}%`,
          severity: battery < 10 ? 'critical' : 'warning',
        },
      });

      io.emit('alert:new', {
        testDriveId,
        type: 'battery',
        message: `Low battery: ${battery}%`,
        severity: battery < 10 ? 'critical' : 'warning',
      });
    }

    // Emit real-time update via WebSocket
    io.emit('sensor:update', {
      testDriveId,
      sensorData,
    });

    res.status(201).json({
      success: true,
      data: sensorData,
    });
  } catch (error) {
    console.error('Error saving sensor data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save sensor data',
    });
  }
});

/**
 * GET /api/ruuvitag/latest/:testDriveId
 * Get latest sensor data for a test drive
 */
router.get('/latest/:testDriveId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { testDriveId } = req.params;

    const [latestLocation, latestSensor] = await Promise.all([
      prisma.location.findFirst({
        where: { testDriveId },
        orderBy: { timestamp: 'desc' },
      }),
      prisma.sensorData.findFirst({
        where: { testDriveId },
        orderBy: { timestamp: 'desc' },
      }),
    ]);

    res.json({
      success: true,
      data: {
        location: latestLocation,
        sensor: latestSensor,
      },
    });
  } catch (error) {
    console.error('Error fetching latest data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch latest data',
    });
  }
});

/**
 * POST /api/ruuvitag/register
 * Register a new RuuviTag MAC address
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { mac, name } = req.body;

    if (!mac) {
      res.status(400).json({
        success: false,
        error: 'MAC address is required',
      });
      return;
    }

    // Upsert: create if not exists, update lastSeen if exists
    const tag = await prisma.ruuviTag.upsert({
      where: { mac },
      update: {
        lastSeen: new Date(),
        ...(name && { name }),
      },
      create: {
        id: uuidv4(),
        mac,
        name: name || null,
      },
    });

    res.status(201).json({
      success: true,
      data: tag,
    });
  } catch (error) {
    console.error('Error registering RuuviTag:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register RuuviTag',
    });
  }
});

/**
 * GET /api/ruuvitag/tags
 * Get list of all RuuviTag MAC addresses (both assigned and discovered)
 */
router.get('/tags', async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all vehicles with their RuuviTag assignments
    const vehicles = await prisma.vehicle.findMany({
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        ruuviTagMac: true,
      },
    });

    // Get all discovered RuuviTags
    const discoveredTags = await prisma.ruuviTag.findMany({
      orderBy: { lastSeen: 'desc' },
    });

    // Build map of assigned MACs
    const assignedMacs = new Map(
      vehicles
        .filter((v: { ruuviTagMac: string | null }) => v.ruuviTagMac)
        .map((v: { id: string; year: number; make: string; model: string; ruuviTagMac: string | null }) => [
          v.ruuviTagMac,
          {
            id: v.id,
            name: `${v.year} ${v.make} ${v.model}`,
          },
        ])
    );

    // Combine discovered tags with assignment status
    const allMacs = new Set([
      ...discoveredTags.map((t: { mac: string }) => t.mac),
      ...Array.from(assignedMacs.keys()),
    ]);

    const tags = Array.from(allMacs).map((mac) => ({
      mac,
      assigned: assignedMacs.has(mac),
      vehicle: assignedMacs.get(mac) || null,
      name: discoveredTags.find((t: { mac: string; name: string | null }) => t.mac === mac)?.name || null,
    }));

    res.json({
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error('Error fetching RuuviTags:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch RuuviTags',
    });
  }
});

export default router;
