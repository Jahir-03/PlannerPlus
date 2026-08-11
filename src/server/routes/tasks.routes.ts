import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { z } from 'zod';

const router = Router();

const createTaskSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'REVIEW', 'COMPLETED', 'CANCELLED']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assigneeId: z.string().optional(),
  organizationId: z.string(),
  eventId: z.string().optional(),
  deadline: z.string().optional(),
  estimatedHours: z.number().optional(),
});

// Get tasks with filtering
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { orgId, eventId, assigneeId, status } = req.query;

  try {
    const tasks = await prisma.task.findMany({
      where: {
        ...(orgId ? { organizationId: String(orgId) } : {}),
        ...(eventId ? { eventId: String(eventId) } : {}),
        ...(assigneeId ? { assigneeId: String(assigneeId) } : {}),
        ...(status ? { status: String(status) } : {}),
      },
      include: {
        organization: { select: { id: true, name: true, code: true, type: true } },
        assignee: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        creator: { select: { id: true, fullName: true } },
        event: { select: { id: true, title: true } },
        comments: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create task
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const data = createTaskSchema.parse(req.body);

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        creatorId: req.user!.userId,
        assigneeId: data.assigneeId,
        organizationId: data.organizationId,
        eventId: data.eventId,
        deadline: data.deadline ? new Date(data.deadline) : null,
        estimatedHours: data.estimatedHours,
      },
      include: {
        organization: true,
        assignee: true,
        creator: true,
      },
    });

    await logAuditEvent({
      userId: req.user!.userId,
      action: 'TASK_CREATED',
      entity: 'Task',
      entityId: task.id,
      details: `Created task "${task.title}" in org ${task.organizationId}`,
      ipAddress: req.ip,
    });

    return res.status(201).json(task);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to create task' });
  }
});

// Update task status or assignee
router.patch('/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status, priority, assigneeId, deadline } = req.body;

  try {
    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(assigneeId !== undefined ? { assigneeId } : {}),
        ...(deadline ? { deadline: new Date(deadline) } : {}),
      },
      include: {
        organization: true,
        assignee: true,
      },
    });

    await logAuditEvent({
      userId: req.user!.userId,
      action: 'TASK_UPDATED',
      entity: 'Task',
      entityId: id,
      details: `Updated task status to ${status}`,
      ipAddress: req.ip,
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

// Add comment to task
router.post('/:id/comments', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Comment content is required' });
  }

  try {
    const comment = await prisma.taskComment.create({
      data: {
        taskId: id,
        userId: req.user!.userId,
        userFullName: req.user!.fullName,
        content,
      },
    });

    return res.status(201).json(comment);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to post comment' });
  }
});

export default router;
