/**
 * Vehicle Routes
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET all vehicles
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: vehicles });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch vehicles' });
  }
});

// GET vehicle by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id },
      include: { testDrives: true },
    });

    if (!vehicle) {
      res.status(404).json({ success: false, error: 'Vehicle not found' });
      return;
    }

    res.json({ success: true, data: vehicle });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch vehicle' });
  }
});

// POST create vehicle
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { make, model, year, vin, color, ruuviTagMac } = req.body;

    const vehicle = await prisma.vehicle.create({
      data: { make, model, year, vin, color, ruuviTagMac },
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ success: false, error: 'Failed to create vehicle' });
  }
});

// PUT update vehicle
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { make, model, year, vin, color, ruuviTagMac, available } = req.body;

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...(make !== undefined && { make }),
        ...(model !== undefined && { model }),
        ...(year !== undefined && { year }),
        ...(vin !== undefined && { vin }),
        ...(color !== undefined && { color }),
        ...(ruuviTagMac !== undefined && { ruuviTagMac }),
        ...(available !== undefined && { available }),
      },
    });

    res.json({ success: true, data: vehicle });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ success: false, error: 'Failed to update vehicle' });
  }
});

export default router;
