import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../utils/auditLogger.js';

const router = Router();

// Middleware to verify superuser / administrative authority
const requireSuperUser = async (req: AuthenticatedRequest, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    include: { memberships: true },
  });

  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  const isSuperUser =
    user.email === 'admin@srmist.edu.in' ||
    user.studentId === 'admin' ||
    user.memberships.some((m) => ['DIRECTOR', 'DY_DIRECTOR', 'ADMIN_STAFF'].includes(m.role));

  if (!isSuperUser) {
    return res.status(403).json({ error: 'Forbidden: Superuser administrative privileges required' });
  }

  next();
};

router.use(authenticateJWT, requireSuperUser);

// 1. Overall System Analytics & Stats
router.get('/stats', async (req: AuthenticatedRequest, res) => {
  try {
    const [totalUsers, activeUsers, totalOrgs, totalEvents, totalTasks, totalApprovals, totalAuditLogs] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.organization.count(),
        prisma.event.count(),
        prisma.task.count(),
        prisma.approvalWorkflow.count(),
        prisma.auditLog.count(),
      ]);

    return res.json({
      totalUsers,
      activeUsers,
      totalOrgs,
      totalEvents,
      totalTasks,
      totalApprovals,
      totalAuditLogs,
      systemStatus: 'ONLINE',
      uptime: process.uptime(),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch admin stats' });
  }
});

// 2. User Management: List All Users
router.get('/users', async (req: AuthenticatedRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        studentId: true,
        college: true,
        phone: true,
        isActive: true,
        createdAt: true,
        memberships: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                code: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
});

// 3. User Management: Create User
const createUserSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  studentId: z.string().optional(),
  college: z.string().optional(),
  phone: z.string().optional(),
  organizationId: z.string().optional(),
  role: z.string().optional(),
});

router.post('/users', async (req: AuthenticatedRequest, res) => {
  try {
    const data = createUserSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash,
        studentId: data.studentId || undefined,
        college: data.college || 'SRM Institute of Science and Technology',
        phone: data.phone || undefined,
      },
    });

    // Optionally assign initial org membership
    if (data.organizationId && data.role) {
      await prisma.organizationMembership.create({
        data: {
          userId: user.id,
          organizationId: data.organizationId,
          role: data.role,
          title: data.role.replace(/_/g, ' '),
        },
      });
    }

    await logAuditEvent({
      userId: req.user!.userId,
      action: 'ADMIN_USER_CREATED',
      entity: 'User',
      entityId: user.id,
      details: `Admin created user ${user.email} (${user.fullName})`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to create user' });
  }
});

// 4. User Management: Toggle Active Status
router.patch('/users/:id/status', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
    });

    await logAuditEvent({
      userId: req.user!.userId,
      action: 'ADMIN_USER_STATUS_CHANGED',
      entity: 'User',
      entityId: user.id,
      details: `Admin changed ${user.email} active status to ${user.isActive}`,
      ipAddress: req.ip,
    });

    return res.json({ message: 'User status updated', user });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update user status' });
  }
});

// 5. Membership Management: Assign or Update Role
const membershipSchema = z.object({
  userId: z.string(),
  organizationId: z.string(),
  role: z.string(),
  title: z.string().optional(),
});

router.post('/memberships', async (req: AuthenticatedRequest, res) => {
  try {
    const data = membershipSchema.parse(req.body);

    const membership = await prisma.organizationMembership.upsert({
      where: {
        userId_organizationId: {
          userId: data.userId,
          organizationId: data.organizationId,
        },
      },
      update: {
        role: data.role,
        title: data.title || data.role.replace(/_/g, ' '),
      },
      create: {
        userId: data.userId,
        organizationId: data.organizationId,
        role: data.role,
        title: data.title || data.role.replace(/_/g, ' '),
      },
      include: {
        organization: true,
        user: true,
      },
    });

    await logAuditEvent({
      userId: req.user!.userId,
      action: 'ADMIN_MEMBERSHIP_ASSIGNED',
      entity: 'OrganizationMembership',
      entityId: membership.id,
      details: `Assigned ${membership.user.email} to ${membership.organization.name} as ${data.role}`,
      ipAddress: req.ip,
    });

    return res.json({ message: 'Membership assigned successfully', membership });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to assign membership' });
  }
});

// 6. Membership Management: Remove Membership
router.delete('/memberships/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    await prisma.organizationMembership.delete({
      where: { id },
    });

    await logAuditEvent({
      userId: req.user!.userId,
      action: 'ADMIN_MEMBERSHIP_REMOVED',
      entity: 'OrganizationMembership',
      entityId: id,
      details: `Admin revoked membership ID ${id}`,
      ipAddress: req.ip,
    });

    return res.json({ message: 'Membership removed successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to remove membership' });
  }
});

// 7. Organization Management: Create New Organization
const createOrgSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  type: z.enum(['CLUB', 'CORE_DOMAIN']),
  description: z.string().optional(),
});

router.post('/orgs', async (req: AuthenticatedRequest, res) => {
  try {
    const data = createOrgSchema.parse(req.body);

    const existing = await prisma.organization.findFirst({
      where: {
        OR: [{ code: data.code }, { name: data.name }],
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Organization with this name or code already exists' });
    }

    const org = await prisma.organization.create({
      data: {
        name: data.name,
        code: data.code.toUpperCase(),
        type: data.type,
        description: data.description,
      },
    });

    await logAuditEvent({
      userId: req.user!.userId,
      action: 'ADMIN_ORG_CREATED',
      entity: 'Organization',
      entityId: org.id,
      details: `Admin created workspace ${org.name} (${org.code})`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ message: 'Organization created successfully', org });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to create organization' });
  }
});

// 8. Organization Management: Delete Organization
router.delete('/orgs/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            memberships: true,
            tasks: true,
            leadEvents: true,
          },
        },
      },
    });

    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete associated task comments & tasks
      const tasks = await tx.task.findMany({
        where: { organizationId: id },
        select: { id: true },
      });
      const taskIds = tasks.map((t) => t.id);
      if (taskIds.length > 0) {
        await tx.taskComment.deleteMany({
          where: { taskId: { in: taskIds } },
        });
        await tx.task.deleteMany({
          where: { organizationId: id },
        });
      }

      // 2. Clear event meeting logs
      await tx.eventMeetingLog.updateMany({
        where: { organizationId: id },
        data: { organizationId: null },
      });

      // 3. Clear or delete budgets & expenses
      const budgets = await tx.budget.findMany({
        where: { organizationId: id },
        select: { id: true },
      });
      const budgetIds = budgets.map((b) => b.id);
      if (budgetIds.length > 0) {
        await tx.expenseItem.deleteMany({
          where: { budgetId: { in: budgetIds } },
        });
        await tx.budget.deleteMany({
          where: { organizationId: id },
        });
      }

      // 4. Delete reservations & resources
      const resources = await tx.resource.findMany({
        where: { organizationId: id },
        select: { id: true },
      });
      const resourceIds = resources.map((r) => r.id);
      if (resourceIds.length > 0) {
        await tx.resourceReservation.deleteMany({
          where: { resourceId: { in: resourceIds } },
        });
        await tx.resource.deleteMany({
          where: { organizationId: id },
        });
      }

      // 5. Delete memberships
      await tx.organizationMembership.deleteMany({
        where: { organizationId: id },
      });

      // 6. Delete or clean up leadEvents
      const events = await tx.event.findMany({
        where: { leadOrganizationId: id },
        select: { id: true },
      });
      for (const ev of events) {
        await tx.task.deleteMany({ where: { eventId: ev.id } });
        const workflows = await tx.approvalWorkflow.findMany({
          where: { eventId: ev.id },
          select: { id: true },
        });
        const wfIds = workflows.map((w) => w.id);
        if (wfIds.length > 0) {
          await tx.approvalStep.deleteMany({ where: { workflowId: { in: wfIds } } });
          await tx.approvalWorkflow.deleteMany({ where: { eventId: ev.id } });
        }
        await tx.resourceReservation.deleteMany({ where: { eventId: ev.id } });
        await tx.event.delete({ where: { id: ev.id } });
      }

      // 7. Finally delete the organization
      await tx.organization.delete({
        where: { id },
      });
    });

    await logAuditEvent({
      userId: req.user!.userId,
      action: 'ADMIN_ORG_DELETED',
      entity: 'Organization',
      entityId: id,
      details: `Admin deleted organization "${org.name}" (${org.code})`,
      ipAddress: req.ip,
    });

    return res.json({ message: `Organization "${org.name}" deleted successfully` });
  } catch (error: any) {
    console.error('Error deleting organization:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete organization' });
  }
});

// 9. System Activity Audit Logs
router.get('/audit-logs', async (req: AuthenticatedRequest, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 60,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return res.json(logs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch audit logs' });
  }
});

// 10. Superuser User Management: Reset User Password
router.patch('/users/:id/password', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    await logAuditEvent({
      userId: req.user!.userId,
      action: 'ADMIN_USER_PASSWORD_RESET',
      entity: 'User',
      entityId: id,
      details: `Admin reset password for ${targetUser.email}`,
      ipAddress: req.ip,
    });

    return res.json({ message: `Password reset successfully for ${targetUser.email}` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to reset password' });
  }
});

// 11. Superuser User Management: Delete User
router.delete('/users/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser.email === 'admin@srmist.edu.in' || targetUser.studentId === 'admin') {
      return res.status(400).json({ error: 'Root superuser account cannot be deleted' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.refreshSession.deleteMany({ where: { userId: id } });
      await tx.organizationMembership.deleteMany({ where: { userId: id } });
      await tx.task.updateMany({ where: { assigneeId: id }, data: { assigneeId: null } });
      await tx.auditLog.updateMany({ where: { userId: id }, data: { userId: null } });
      await tx.user.delete({ where: { id } });
    });

    await logAuditEvent({
      userId: req.user!.userId,
      action: 'ADMIN_USER_DELETED',
      entity: 'User',
      entityId: id,
      details: `Admin deleted user ${targetUser.email} (${targetUser.fullName})`,
      ipAddress: req.ip,
    });

    return res.json({ message: `User ${targetUser.email} deleted successfully` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to delete user' });
  }
});

// 12. Superuser Organization Management: Update Workspace
router.patch('/orgs/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, type } = req.body;

    const org = await prisma.organization.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(code ? { code: code.toUpperCase() } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(type ? { type } : {}),
      },
    });

    await logAuditEvent({
      userId: req.user!.userId,
      action: 'ADMIN_ORG_UPDATED',
      entity: 'Organization',
      entityId: id,
      details: `Admin updated organization ${org.name} (${org.code})`,
      ipAddress: req.ip,
    });

    return res.json({ message: 'Organization updated successfully', org });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update organization' });
  }
});

// 13. Superuser Event Operations: List All Events Across All Organizations
router.get('/events', async (req: AuthenticatedRequest, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        leadOrganization: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
        approvalWorkflows: {
          include: {
            steps: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            reservations: true,
          },
        },
      },
    });

    return res.json(events);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch all events' });
  }
});

// 14. Superuser Event Operations: Force Status Override
router.patch('/events/:id/status', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const event = await prisma.event.update({
      where: { id },
      data: { status },
      include: { leadOrganization: true },
    });

    await logAuditEvent({
      userId: req.user!.userId,
      action: 'ADMIN_EVENT_STATUS_OVERRIDE',
      entity: 'Event',
      entityId: id,
      details: `Admin overridden event status for "${event.title}" to ${status}`,
      ipAddress: req.ip,
    });

    return res.json({ message: 'Event status updated', event });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update event status' });
  }
});

// 15. Superuser Event Operations: Delete Event
router.delete('/events/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    await prisma.$transaction(async (tx) => {
      await tx.task.deleteMany({ where: { eventId: id } });
      const workflows = await tx.approvalWorkflow.findMany({ where: { eventId: id }, select: { id: true } });
      const wfIds = workflows.map((w) => w.id);
      if (wfIds.length > 0) {
        await tx.approvalStep.deleteMany({ where: { workflowId: { in: wfIds } } });
        await tx.approvalWorkflow.deleteMany({ where: { eventId: id } });
      }
      await tx.resourceReservation.deleteMany({ where: { eventId: id } });
      await tx.event.delete({ where: { id } });
    });

    await logAuditEvent({
      userId: req.user!.userId,
      action: 'ADMIN_EVENT_DELETED',
      entity: 'Event',
      entityId: id,
      details: `Admin deleted event "${event.title}"`,
      ipAddress: req.ip,
    });

    return res.json({ message: `Event "${event.title}" deleted successfully` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to delete event' });
  }
});

// 16. Superuser Approvals Oversight: List All Workflows & Steps
router.get('/approvals', async (req: AuthenticatedRequest, res) => {
  try {
    const workflows = await prisma.approvalWorkflow.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            status: true,
            leadOrganization: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        steps: {
          orderBy: { stepOrder: 'asc' },
          include: {
            approver: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return res.json(workflows);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch approvals' });
  }
});

// 17. Superuser Approvals: Force Step Override (Approve/Reject)
router.post('/approvals/steps/:id/override', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be APPROVED or REJECTED' });
    }

    const step = await prisma.approvalStep.findUnique({
      where: { id },
      include: { workflow: true },
    });

    if (!step) {
      return res.status(404).json({ error: 'Approval step not found' });
    }

    const updatedStep = await prisma.approvalStep.update({
      where: { id },
      data: {
        status,
        comments: comments || `Superuser Override (${status})`,
        approverId: req.user!.userId,
      },
    });

    // Check overall workflow completion
    const allSteps = await prisma.approvalStep.findMany({
      where: { workflowId: step.workflowId },
    });

    const isAllApproved = allSteps.every((s) => s.status === 'APPROVED');
    const isAnyRejected = allSteps.some((s) => s.status === 'REJECTED');

    let workflowStatus = step.workflow.status;
    if (isAllApproved) {
      workflowStatus = 'APPROVED';
    } else if (isAnyRejected) {
      workflowStatus = 'REJECTED';
    }

    if (workflowStatus !== step.workflow.status) {
      await prisma.approvalWorkflow.update({
        where: { id: step.workflowId },
        data: { status: workflowStatus },
      });

      // Update event status if linked
      if (step.workflow.eventId && workflowStatus === 'APPROVED') {
        await prisma.event.update({
          where: { id: step.workflow.eventId },
          data: { status: 'APPROVED' },
        });
      }
    }

    await logAuditEvent({
      userId: req.user!.userId,
      action: 'ADMIN_APPROVAL_OVERRIDE',
      entity: 'ApprovalStep',
      entityId: id,
      details: `Admin overridden step #${step.stepOrder} (${step.roleTarget}) to ${status}`,
      ipAddress: req.ip,
    });

    return res.json({ message: `Step overridden to ${status}`, step: updatedStep, workflowStatus });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to override approval step' });
  }
});

// 18. Superuser Global Task Management: List All Tasks
router.get('/tasks', async (req: AuthenticatedRequest, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        assignee: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return res.json(tasks);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch tasks' });
  }
});

// 19. Superuser Task Control: Force Update / Delete Task
router.patch('/tasks/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assigneeId } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(assigneeId !== undefined ? { assigneeId: assigneeId || null } : {}),
      },
      include: { organization: true },
    });

    return res.json({ message: 'Task updated', task });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update task' });
  }
});

router.delete('/tasks/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    await prisma.taskComment.deleteMany({ where: { taskId: id } });
    await prisma.task.delete({ where: { id } });
    return res.json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to delete task' });
  }
});

// 20. Superuser Resource Oversight
router.get('/resources', async (req: AuthenticatedRequest, res) => {
  try {
    const resources = await prisma.resource.findMany({
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        reservations: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        },
      },
    });

    return res.json(resources);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch resources' });
  }
});

router.post('/resources', async (req: AuthenticatedRequest, res) => {
  try {
    const { name, category, totalQuantity, organizationId } = req.body;
    if (!name || !category || !organizationId) {
      return res.status(400).json({ error: 'Name, category, and organization are required' });
    }

    const resource = await prisma.resource.create({
      data: {
        name,
        category,
        totalQuantity: Number(totalQuantity) || 1,
        organizationId,
      },
    });

    await logAuditEvent({
      userId: req.user!.userId,
      action: 'ADMIN_RESOURCE_CREATED',
      entity: 'Resource',
      entityId: resource.id,
      details: `Admin added resource "${resource.name}"`,
      ipAddress: req.ip,
    });

    return res.status(201).json(resource);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create resource' });
  }
});

router.delete('/resources/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    await prisma.resourceReservation.deleteMany({ where: { resourceId: id } });
    await prisma.resource.delete({ where: { id } });
    return res.json({ message: 'Resource deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to delete resource' });
  }
});

router.delete('/reservations/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    await prisma.resourceReservation.delete({ where: { id } });
    return res.json({ message: 'Reservation cancelled/released successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to delete reservation' });
  }
});

export default router;
