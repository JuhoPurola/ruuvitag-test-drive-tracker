/**
 * Test Drive Routes
 * Handles CRUD operations for test drives
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/testdrives
 * List all test drives with optional filtering
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, vehicleId, salesPersonId } = req.query;

    const testDrives = await prisma.testDrive.findMany({
      where: {
        ...(status && { status: status as string }),
        ...(vehicleId && { vehicleId: vehicleId as string }),
        ...(salesPersonId && { salesPersonId: salesPersonId as string }),
      },
      include: {
        vehicle: true,
        customer: true,
        salesPerson: true,
        locations: {
          orderBy: { timestamp: 'asc' },
        },
        sensorData: {
          orderBy: { timestamp: 'desc' },
          take: 1, // Latest sensor reading
        },
        alerts: {
          where: { acknowledged: false },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    res.json({
      success: true,
      data: testDrives,
    });
  } catch (error) {
    console.error('Error fetching test drives:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch test drives',
    });
  }
});

/**
 * GET /api/testdrives/:id
 * Get a single test drive by ID
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const testDrive = await prisma.testDrive.findUnique({
      where: { id },
      include: {
        vehicle: true,
        customer: true,
        salesPerson: true,
        locations: {
          orderBy: { timestamp: 'asc' },
        },
        sensorData: {
          orderBy: { timestamp: 'asc' },
        },
        alerts: true,
      },
    });

    if (!testDrive) {
      res.status(404).json({
        success: false,
        error: 'Test drive not found',
      });
      return;
    }

    res.json({
      success: true,
      data: testDrive,
    });
  } catch (error) {
    console.error('Error fetching test drive:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch test drive',
    });
  }
});

/**
 * POST /api/testdrives
 * Create a new test drive
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { vehicleId, customerId, salesPersonId, notes } = req.body;

    // Validate required fields
    if (!vehicleId || !customerId || !salesPersonId) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: vehicleId, customerId, salesPersonId',
      });
      return;
    }

    // Check if vehicle is available
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      res.status(404).json({
        success: false,
        error: 'Vehicle not found',
      });
      return;
    }

    if (!vehicle.available) {
      res.status(400).json({
        success: false,
        error: 'Vehicle is not available',
      });
      return;
    }

    // Create test drive
    const testDrive = await prisma.testDrive.create({
      data: {
        id: uuidv4(),
        vehicleId,
        customerId,
        salesPersonId,
        notes,
        status: 'active',
      },
      include: {
        vehicle: true,
        customer: true,
        salesPerson: true,
      },
    });

    // Mark vehicle as unavailable
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { available: false },
    });

    res.status(201).json({
      success: true,
      data: testDrive,
      message: 'Test drive started successfully',
    });
  } catch (error) {
    console.error('Error creating test drive:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create test drive',
    });
  }
});

/**
 * PUT /api/testdrives/:id
 * Update a test drive (end it or add notes)
 */
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { endTime, status, notes } = req.body;

    const testDrive = await prisma.testDrive.findUnique({
      where: { id },
      include: { locations: true },
    });

    if (!testDrive) {
      res.status(404).json({
        success: false,
        error: 'Test drive not found',
      });
      return;
    }

    // Calculate distance and duration if ending
    let distance: number | undefined;
    let duration: number | undefined;

    if (endTime) {
      const start = new Date(testDrive.startTime);
      const end = new Date(endTime);
      duration = Math.round((end.getTime() - start.getTime()) / 60000); // minutes

      // Calculate distance from locations
      if (testDrive.locations.length > 1) {
        distance = calculateTotalDistance(testDrive.locations);
      }
    }

    // Update test drive
    const updatedTestDrive = await prisma.testDrive.update({
      where: { id },
      data: {
        ...(endTime && { endTime: new Date(endTime) }),
        ...(status && { status }),
        ...(notes && { notes }),
        ...(distance && { distance }),
        ...(duration && { duration }),
      },
      include: {
        vehicle: true,
        customer: true,
        salesPerson: true,
        locations: true,
        sensorData: true,
        alerts: true,
      },
    });

    // If ending, mark vehicle as available
    if (status === 'completed' || status === 'cancelled') {
      await prisma.vehicle.update({
        where: { id: testDrive.vehicleId },
        data: { available: true },
      });
    }

    res.json({
      success: true,
      data: updatedTestDrive,
      message: 'Test drive updated successfully',
    });
  } catch (error) {
    console.error('Error updating test drive:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update test drive',
    });
  }
});

/**
 * DELETE /api/testdrives/:id
 * Delete a test drive
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const testDrive = await prisma.testDrive.findUnique({
      where: { id },
    });

    if (!testDrive) {
      res.status(404).json({
        success: false,
        error: 'Test drive not found',
      });
      return;
    }

    await prisma.testDrive.delete({
      where: { id },
    });

    // Mark vehicle as available
    await prisma.vehicle.update({
      where: { id: testDrive.vehicleId },
      data: { available: true },
    });

    res.json({
      success: true,
      message: 'Test drive deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting test drive:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete test drive',
    });
  }
});

/**
 * Helper function to calculate total distance from locations using Haversine formula
 */
function calculateTotalDistance(locations: Array<{ latitude: number; longitude: number }>): number {
  let totalDistance = 0;

  for (let i = 1; i < locations.length; i++) {
    const prev = locations[i - 1];
    const curr = locations[i];
    totalDistance += haversineDistance(
      prev.latitude,
      prev.longitude,
      curr.latitude,
      curr.longitude
    );
  }

  return Math.round(totalDistance * 100) / 100; // Round to 2 decimal places
}

/**
 * Haversine formula for calculating distance between two GPS coordinates
 * Returns distance in kilometers
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export default router;
