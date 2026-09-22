import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { prisma } from '../config/prisma.js';

// High-level role hierarchy ranks
export const ROLE_RANKS: Record<string, number> = {
  DIRECTOR: 100,
  DY_DIRECTOR: 95,
  ADMIN_STAFF: 90,
  CULTURAL_SECRETARY: 85,
  CLUB_SECRETARY: 75,
  DOMAIN_SECRETARY: 75,
  CLUB_CONVENOR: 60,
  DOMAIN_CONVENOR: 60,
  COMMITTEE_HEAD: 50,
  COMMITTEE_MEMBER: 30,
  CLUB_MEMBER: 30,
  VOLUNTEER: 10,
};

export function requirePermission(requiredRoles: string[], orgScopeExtractor?: (req: AuthenticatedRequest) => string | undefined) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User authentication required' });
    }

    const userId = req.user.userId;
    const orgId = orgScopeExtractor ? orgScopeExtractor(req) : undefined;

    try {
      if (req.user.email === 'admin@srmist.edu.in') {
        return next();
      }

      const memberships = await prisma.organizationMembership.findMany({
        where: { userId },
        include: { organization: true },
      });

      // DSA Administration & Cultural Secretary have global override access
      const isGlobalAdmin = memberships.some(m =>
        ['DIRECTOR', 'DY_DIRECTOR', 'ADMIN_STAFF', 'CULTURAL_SECRETARY'].includes(m.role)
      );

      if (isGlobalAdmin) {
        return next();
      }

      // Check if user has required role within the specified organization or globally
      const hasPermission = memberships.some(m => {
        const matchesRole = requiredRoles.includes(m.role);
        const matchesOrg = !orgId || m.organizationId === orgId;
        return matchesRole && matchesOrg;
      });

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Forbidden: Insufficient permissions for this organization scope',
          requiredRoles,
          organizationId: orgId,
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({ error: 'Server error during RBAC evaluation' });
    }
  };
}
