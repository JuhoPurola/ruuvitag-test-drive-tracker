/**
 * Salesperson Routes
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET all salespeople
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const salespeople = await prisma.salesPerson.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: salespeople });
  } catch (error) {
    console.error('Error fetching salespeople:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch salespeople' });
  }
});

// GET single salesperson by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const salesperson = await prisma.salesPerson.findUnique({
      where: { id },
      include: {
        testDrives: {
          include: {
            vehicle: true,
            customer: true,
          },
        },
      },
    });

    if (!salesperson) {
      res.status(404).json({ success: false, error: 'Salesperson not found' });
      return;
    }

    res.json({ success: true, data: salesperson });
  } catch (error) {
    console.error('Error fetching salesperson:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch salesperson' });
  }
});

// POST create salesperson
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, role } = req.body;

    const salesperson = await prisma.salesPerson.create({
      data: { name, email, phone, role },
    });

    res.status(201).json({ success: true, data: salesperson });
  } catch (error) {
    console.error('Error creating salesperson:', error);
    res.status(500).json({ success: false, error: 'Failed to create salesperson' });
  }
});

// PUT update salesperson
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;

    const salesperson = await prisma.salesPerson.update({
      where: { id },
      data: { name, email, phone, role },
    });

    res.json({ success: true, data: salesperson });
  } catch (error) {
    console.error('Error updating salesperson:', error);
    res.status(500).json({ success: false, error: 'Failed to update salesperson' });
  }
});

// DELETE salesperson
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.salesPerson.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Salesperson deleted successfully' });
  } catch (error) {
    console.error('Error deleting salesperson:', error);
    res.status(500).json({ success: false, error: 'Failed to delete salesperson' });
  }
});

export default router;
