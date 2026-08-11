import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../utils/auditLogger.js';

const router = Router();

// List all approval workflows
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { status, requestType } = req.query;

  try {
    const workflows = await prisma.approvalWorkflow.findMany({
      where: {
        ...(status ? { status: String(status) } : {}),
        ...(requestType ? { requestType: String(requestType) } : {}),
      },
      include: {
        event: { select: { id: true, title: true, venue: true, startDate: true } },
        steps: {
          include: { approver: { select: { id: true, fullName: true, email: true } } },
          orderBy: { stepOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(workflows);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch approval workflows' });
  }
});

// Process Approval Step (Approve / Reject)
router.post('/steps/:stepId/action', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { stepId } = req.params;
  const { action, comments } = req.body; // action: "APPROVE" or "REJECT"

  if (!['APPROVE', 'REJECT'].includes(action)) {
    return res.status(400).json({ error: 'Action must be APPROVE or REJECT' });
  }

  try {
    const step = await prisma.approvalStep.findUnique({
      where: { id: stepId },
      include: { workflow: { include: { steps: { orderBy: { stepOrder: 'asc' } } } } },
    });

    if (!step) {
      return res.status(404).json({ error: 'Approval step not found' });
    }

    const newStepStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    await prisma.approvalStep.update({
      where: { id: stepId },
      data: {
        status: newStepStatus,
        approverId: req.user!.userId,
        comments,
      },
    });

    const workflowSteps = step.workflow.steps;
    const currentStepIndex = workflowSteps.findIndex(s => s.id === stepId);

    let updatedWorkflowStatus = step.workflow.status;

    if (action === 'REJECT') {
      updatedWorkflowStatus = 'REJECTED';
      if (step.workflow.eventId) {
        await prisma.event.update({
          where: { id: step.workflow.eventId },
          data: { status: 'DRAFT' },
        });
      }
    } else if (action === 'APPROVE') {
      // Check if all steps are approved
      const allApproved = workflowSteps.every((s, idx) =>
        idx === currentStepIndex ? true : s.status === 'APPROVED'
      );

      if (allApproved) {
        updatedWorkflowStatus = 'APPROVED';
        if (step.workflow.eventId) {
          await prisma.event.update({
            where: { id: step.workflow.eventId },
            data: { status: 'APPROVED' },
          });
        }
      }
    }

    await prisma.approvalWorkflow.update({
      where: { id: step.workflowId },
      data: { status: updatedWorkflowStatus },
    });

    await logAuditEvent({
      userId: req.user!.userId,
      action: `APPROVAL_${action}D`,
      entity: 'ApprovalWorkflow',
      entityId: step.workflowId,
      details: `${action}d step ${step.stepOrder} for workflow "${step.workflow.title}"`,
      ipAddress: req.ip,
    });

    return res.json({ message: `Workflow step ${action.toLowerCase()}d successfully`, workflowStatus: updatedWorkflowStatus });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to process approval step' });
  }
});

export default router;
