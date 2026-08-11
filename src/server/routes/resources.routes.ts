import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { z } from 'zod';

const router = Router();

const reservationSchema = z.object({
  resourceId: z.string(),
  eventId: z.string(),
  quantity: z.number().min(1),
  startTime: z.string(),
  endTime: z.string(),
});

// List all resources with reservations
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const resources = await prisma.resource.findMany({
      include: {
        organization: { select: { id: true, name: true, code: true } },
        reservations: {
          include: { event: { select: { id: true, title: true } } },
        },
      },
      orderBy: { category: 'asc' },
    });

    return res.json(resources);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Reserve a resource with dynamic conflict-free checking
router.post('/reservations', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const data = reservationSchema.parse(req.body);
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    if (start >= end) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const resource = await prisma.resource.findUnique({
      where: { id: data.resourceId },
      include: { reservations: true },
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Calculate existing reserved quantity during overlapping time window
    const overlapping = resource.reservations.filter(r => {
      if (r.status !== 'CONFIRMED') return false;
      const rStart = new Date(r.startTime);
      const rEnd = new Date(r.endTime);
      return start < rEnd && end > rStart;
    });

    const alreadyReservedQty = overlapping.reduce((sum, r) => sum + r.quantity, 0);
    const availableQty = resource.totalQuantity - alreadyReservedQty;

    if (data.quantity > availableQty) {
      return res.status(409).json({
        error: 'Resource reservation conflict',
        requestedQuantity: data.quantity,
        availableQuantity: availableQty,
        totalQuantity: resource.totalQuantity,
        conflictingEvents: overlapping.map(r => r.eventId),
      });
    }

    const reservation = await prisma.resourceReservation.create({
      data: {
        resourceId: data.resourceId,
        eventId: data.eventId,
        quantity: data.quantity,
        startTime: start,
        endTime: end,
        status: 'CONFIRMED',
      },
      include: { resource: true, event: true },
    });

    await logAuditEvent({
      userId: req.user!.userId,
      action: 'RESOURCE_RESERVED',
      entity: 'ResourceReservation',
      entityId: reservation.id,
      details: `Reserved ${data.quantity}x ${resource.name} for event ${data.eventId}`,
      ipAddress: req.ip,
    });

    return res.status(201).json(reservation);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to create reservation' });
  }
});

export default router;
