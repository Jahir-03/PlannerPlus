import { prisma } from '../config/prisma.js';

export async function logAuditEvent(params: {
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  details?: string;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details,
        ipAddress: params.ipAddress,
      },
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
}
