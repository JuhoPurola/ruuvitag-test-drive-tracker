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

export default router;
