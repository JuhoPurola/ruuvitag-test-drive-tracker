/**
 * Analytics Routes
 * Provides statistics and insights about test drives
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/analytics/stats
 * Get overall statistics
 */
router.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [allTestDrives, activeTestDrives, completedTestDrives] = await Promise.all([
      prisma.testDrive.count(),
      prisma.testDrive.count({ where: { status: 'active' } }),
      prisma.testDrive.count({ where: { status: 'completed' } }),
    ]);

    // Calculate averages for completed test drives
    const completedDrives = await prisma.testDrive.findMany({
      where: { status: 'completed' },
      select: { distance: true, duration: true },
    });

    const totalDistance = completedDrives.reduce((sum, drive) => sum + (drive.distance || 0), 0);
    const totalDuration = completedDrives.reduce((sum, drive) => sum + (drive.duration || 0), 0);
    const count = completedDrives.length || 1;

    const stats = {
      totalTestDrives: allTestDrives,
      activeTestDrives,
      completedTestDrives,
      averageDistance: Math.round((totalDistance / count) * 100) / 100,
      averageDuration: Math.round(totalDuration / count),
      conversionRate: allTestDrives > 0 ? Math.round((completedTestDrives / allTestDrives) * 100) : 0,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
    });
  }
});

/**
 * GET /api/analytics/vehicles
 * Get vehicle utilization statistics
 */
router.get('/vehicles', async (_req: Request, res: Response): Promise<void> => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        testDrives: {
          where: { status: 'completed' },
          select: { distance: true },
        },
      },
    });

    const vehicleStats = vehicles.map((vehicle) => {
      const testDriveCount = vehicle.testDrives.length;
      const totalDistance = vehicle.testDrives.reduce((sum, drive) => sum + (drive.distance || 0), 0);

      return {
        vehicleId: vehicle.id,
        vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        testDriveCount,
        totalDistance: Math.round(totalDistance * 100) / 100,
        utilization: testDriveCount > 0 ? Math.min(100, testDriveCount * 10) : 0, // Simple utilization metric
      };
    });

    res.json({
      success: true,
      data: vehicleStats,
    });
  } catch (error) {
    console.error('Error fetching vehicle analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicle analytics',
    });
  }
});

export default router;
