import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { z } from 'zod';

const router = Router();

// Get all organizations (Clubs & Core Domains)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const orgs = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            memberships: true,
            tasks: true,
            leadEvents: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return res.json(orgs);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

// Get organization by ID or Code with full members and workspace stats
router.get('/:idOrCode', authenticateJWT, async (req, res) => {
  const { idOrCode } = req.params;

  try {
    const org = await prisma.organization.findFirst({
      where: {
        OR: [{ id: idOrCode }, { code: idOrCode }],
      },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                studentId: true,
                avatarUrl: true,
              },
            },
          },
        },
        tasks: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        leadEvents: {
          take: 5,
          orderBy: { startDate: 'asc' },
        },
        budgets: true,
        resources: true,
      },
    });

    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    return res.json(org);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch organization workspace' });
  }
});

const assignMembershipSchema = z.object({
  userId: z.string().uuid(),
  organizationId: z.string().uuid(),
  role: z.string(),
  title: z.string().optional(),
});

// Assign or update membership role
router.post(
  '/memberships',
  authenticateJWT,
  requirePermission(['DIRECTOR', 'DY_DIRECTOR', 'ADMIN_STAFF', 'CULTURAL_SECRETARY', 'CLUB_SECRETARY', 'DOMAIN_SECRETARY']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const data = assignMembershipSchema.parse(req.body);

      const membership = await prisma.organizationMembership.upsert({
        where: {
          userId_organizationId: {
            userId: data.userId,
            organizationId: data.organizationId,
          },
        },
        update: {
          role: data.role,
          title: data.title,
        },
        create: {
          userId: data.userId,
          organizationId: data.organizationId,
          role: data.role,
          title: data.title,
        },
      });

      await logAuditEvent({
        userId: req.user!.userId,
        action: 'MEMBERSHIP_ASSIGNED',
        entity: 'OrganizationMembership',
        entityId: membership.id,
        details: `Assigned role ${data.role} to user ${data.userId} in org ${data.organizationId}`,
        ipAddress: req.ip,
      });

      return res.status(200).json(membership);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      return res.status(500).json({ error: error.message || 'Failed to update membership' });
    }
  }
);

export default router;
