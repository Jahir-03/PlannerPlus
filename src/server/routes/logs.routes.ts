import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { z } from 'zod';

const router = Router();

const createLogSchema = z.object({
  type: z.enum(['EVENT', 'MEETING', 'MILESTONE', 'BRIEFING']).default('EVENT'),
  title: z.string().min(3),
  summary: z.string().min(5),
  date: z.string().optional(),
  location: z.string().optional(),
  attendees: z.string().optional(),
  keyDecisions: z.string().optional(),
  organizationId: z.string().optional(),
  eventId: z.string().optional(),
});

const createCommentSchema = z.object({
  content: z.string().min(1),
});

// List all event and meeting logs with filtering
router.get('/', authenticateJWT, async (req, res) => {
  const { type, organizationId, eventId, search } = req.query;

  try {
    const whereClause: any = {};

    if (type && String(type) !== 'ALL') {
      whereClause.type = String(type);
    }
    if (organizationId) {
      whereClause.organizationId = String(organizationId);
    }
    if (eventId) {
      whereClause.eventId = String(eventId);
    }
    if (search) {
      const q = String(search);
      whereClause.OR = [
        { title: { contains: q } },
        { summary: { contains: q } },
        { location: { contains: q } },
        { keyDecisions: { contains: q } },
      ];
    }

    const logs = await prisma.eventMeetingLog.findMany({
      where: whereClause,
      include: {
        organization: {
          select: { id: true, name: true, code: true, type: true },
        },
        event: {
          select: { id: true, title: true },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    return res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return res.status(500).json({ error: 'Failed to fetch event and meeting logs' });
  }
});

// Get single log with complete comment discussion thread
router.get('/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;

  try {
    const log = await prisma.eventMeetingLog.findUnique({
      where: { id },
      include: {
        organization: true,
        event: true,
        comments: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!log) {
      return res.status(404).json({ error: 'Log record not found' });
    }

    return res.json(log);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch log record' });
  }
});

// Create new Event or Meeting log
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const data = createLogSchema.parse(req.body);

    // Fetch user details for author signature
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { memberships: true },
    });

    const roleName = user?.memberships?.[0]?.role
      ? user.memberships[0].role.replace(/_/g, ' ')
      : 'Coordinator';

    const log = await prisma.eventMeetingLog.create({
      data: {
        type: data.type,
        title: data.title,
        summary: data.summary,
        date: data.date ? new Date(data.date) : new Date(),
        location: data.location || null,
        attendees: data.attendees || null,
        keyDecisions: data.keyDecisions || null,
        organizationId: data.organizationId || null,
        eventId: data.eventId || null,
        authorId: req.user!.userId,
        authorName: user?.fullName || 'DSA Delegate',
        authorRole: roleName,
      },
      include: {
        organization: true,
        event: true,
        comments: true,
      },
    });

    await logAuditEvent({
      userId: req.user!.userId,
      action: 'LOG_CREATED',
      entity: 'EventMeetingLog',
      entityId: log.id,
      details: `Created ${log.type} log: "${log.title}"`,
      ipAddress: req.ip,
    });

    return res.status(201).json(log);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Failed to create log:', error);
    return res.status(500).json({ error: 'Failed to create event/meeting log' });
  }
});

// Add a discussion comment to a log
router.post('/:id/comments', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  try {
    const data = createCommentSchema.parse(req.body);

    const logExists = await prisma.eventMeetingLog.findUnique({
      where: { id },
    });

    if (!logExists) {
      return res.status(404).json({ error: 'Log not found' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { memberships: true },
    });

    const roleName = user?.memberships?.[0]?.role
      ? user.memberships[0].role.replace(/_/g, ' ')
      : 'Member';

    const comment = await prisma.logComment.create({
      data: {
        logId: id,
        userId: req.user!.userId,
        authorName: user?.fullName || 'DSA Member',
        authorRole: roleName,
        content: data.content.trim(),
      },
    });

    return res.status(201).json(comment);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }
    return res.status(500).json({ error: 'Failed to post comment' });
  }
});

// Delete a log
router.delete('/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  try {
    await prisma.eventMeetingLog.delete({
      where: { id },
    });

    await logAuditEvent({
      userId: req.user!.userId,
      action: 'LOG_DELETED',
      entity: 'EventMeetingLog',
      entityId: id,
      details: `Deleted log ${id}`,
      ipAddress: req.ip,
    });

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete log' });
  }
});

export default router;
