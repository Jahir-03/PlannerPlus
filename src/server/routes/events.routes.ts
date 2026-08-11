import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { z } from 'zod';

const router = Router();

const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string(),
  leadOrganizationId: z.string(),
  collaboratorOrgIds: z.array(z.string()).optional(),
  venue: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  expectedParticipants: z.number().default(0),
});

// List all events
router.get('/', authenticateJWT, async (req, res) => {
  const { status, leadOrgId } = req.query;

  try {
    const events = await prisma.event.findMany({
      where: {
        ...(status ? { status: String(status) } : {}),
        ...(leadOrgId ? { leadOrganizationId: String(leadOrgId) } : {}),
      },
      include: {
        leadOrganization: { select: { id: true, name: true, code: true, type: true } },
        _count: { select: { tasks: true, approvals: true, reservations: true } },
      },
      orderBy: { startDate: 'asc' },
    });

    return res.json(events);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get event by ID or Slug
router.get('/:idOrSlug', authenticateJWT, async (req, res) => {
  const { idOrSlug } = req.params;

  try {
    const event = await prisma.event.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        leadOrganization: true,
        tasks: {
          include: { assignee: true, organization: true },
        },
        approvals: {
          include: { steps: { include: { approver: true } } },
        },
        reservations: {
          include: { resource: true },
        },
        budget: {
          include: { expenses: true },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.json(event);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch event project details' });
  }
});

// Propose / Create new Event
router.post(
  '/',
  authenticateJWT,
  requirePermission(['DIRECTOR', 'DY_DIRECTOR', 'ADMIN_STAFF', 'CULTURAL_SECRETARY', 'CLUB_SECRETARY', 'DOMAIN_SECRETARY', 'CLUB_CONVENOR', 'DOMAIN_CONVENOR']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const data = createEventSchema.parse(req.body);
      const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

      const event = await prisma.event.create({
        data: {
          title: data.title,
          slug,
          description: data.description,
          leadOrganizationId: data.leadOrganizationId,
          collaboratorOrgIds: JSON.stringify(data.collaboratorOrgIds || []),
          venue: data.venue,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          expectedParticipants: data.expectedParticipants,
          status: 'PENDING_APPROVAL',
        },
        include: { leadOrganization: true },
      });

      // Automatically create an Approval Workflow for Event Proposal
      const workflow = await prisma.approvalWorkflow.create({
        data: {
          requestType: 'EVENT_PROPOSAL',
          title: `Event Proposal Approval: ${event.title}`,
          eventId: event.id,
          requesterId: req.user!.userId,
          requesterName: req.user!.fullName,
          status: 'PENDING',
          steps: {
            create: [
              { stepOrder: 1, roleTarget: 'CULTURAL_SECRETARY', status: 'PENDING' },
              { stepOrder: 2, roleTarget: 'DIRECTOR', status: 'PENDING' },
            ],
          },
        },
      });

      await logAuditEvent({
        userId: req.user!.userId,
        action: 'EVENT_PROPOSED',
        entity: 'Event',
        entityId: event.id,
        details: `Proposed event "${event.title}" under ${event.leadOrganization.name}`,
        ipAddress: req.ip,
      });

      return res.status(201).json({ event, workflow });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      return res.status(500).json({ error: error.message || 'Failed to create event' });
    }
  }
);

// Update Event Status (e.g. Approved -> Preparation -> Execution)
router.patch('/:id/status', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await prisma.event.update({
      where: { id },
      data: { status },
    });

    await logAuditEvent({
      userId: req.user!.userId,
      action: 'EVENT_STATUS_CHANGED',
      entity: 'Event',
      entityId: id,
      details: `Changed event status to ${status}`,
      ipAddress: req.ip,
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update event status' });
  }
});

export default router;
