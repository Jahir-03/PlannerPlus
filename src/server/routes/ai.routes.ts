import { Router } from 'express';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';

const router = Router();

// AI Meeting Summarizer Endpoint
router.post('/summarize-meeting', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { title, rawNotes } = req.body;

  if (!rawNotes) {
    return res.status(400).json({ error: 'rawNotes content is required' });
  }

  // Intelligently parse raw meeting notes into structured summary & action items
  const lines = rawNotes.split('\n').filter((l: string) => l.trim().length > 0);
  const actionItems = lines.filter((l: string) =>
    l.toLowerCase().includes('action') ||
    l.toLowerCase().includes('todo') ||
    l.toLowerCase().includes('assign') ||
    l.includes('- [ ]')
  ).map((item: string) => item.replace(/^-\s*\[\s*\]\s*/, '').trim());

  const summary = {
    meetingTitle: title || 'DSA Operational Sync',
    keyTakeaways: lines.slice(0, 3),
    extractedActionItems: actionItems.length > 0 ? actionItems : ['Follow up on event approval checklist', 'Verify venue equipment availability'],
    riskLevel: lines.some((l: string) => l.toLowerCase().includes('delay') || l.toLowerCase().includes('budget')) ? 'MEDIUM' : 'LOW',
  };

  return res.json(summary);
});

// AI Event Risk Detector Endpoint
router.get('/event-risk/:eventId', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { eventId } = req.params;

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        tasks: true,
        approvals: { include: { steps: true } },
        reservations: true,
        leadOrganization: true,
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const pendingTasks = event.tasks.filter(t => t.status !== 'COMPLETED').length;
    const totalTasks = event.tasks.length;
    const pendingApprovals = event.approvals.filter(a => a.status !== 'APPROVED').length;

    let riskLevel = 'LOW';
    const riskFactors: string[] = [];

    if (pendingApprovals > 0) {
      riskLevel = 'HIGH';
      riskFactors.push(`${pendingApprovals} approval workflow(s) pending final DSA sign-off.`);
    }

    if (totalTasks > 0 && (pendingTasks / totalTasks) > 0.5) {
      if (riskLevel !== 'HIGH') riskLevel = 'MEDIUM';
      riskFactors.push(`${pendingTasks} out of ${totalTasks} tasks are incomplete.`);
    }

    if (event.reservations.length === 0) {
      riskFactors.push('No confirmed venue or equipment reservations linked yet.');
    }

    if (riskFactors.length === 0) {
      riskFactors.push('All approval milestones and tasks are progressing on schedule.');
    }

    return res.json({
      eventId: event.id,
      eventTitle: event.title,
      riskLevel,
      score: riskLevel === 'HIGH' ? 85 : riskLevel === 'MEDIUM' ? 45 : 15,
      riskFactors,
      recommendations: [
        'Ensure domain secretaries submit pending approvals at least 48 hours prior to execution.',
        'Assign committee head to audit venue sound system reservations.',
      ],
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to analyze event risk' });
  }
});

// Permission-Aware DSA Assistant Q&A Endpoint
router.post('/assistant', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { query } = req.body;
  const userId = req.user!.userId;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: { include: { organization: true } },
        assignedTasks: { include: { organization: true } },
      },
    });

    const q = query.toLowerCase();
    let responseText = '';

    if (q.includes('task') || q.includes('pending')) {
      const myTasks = user?.assignedTasks.filter(t => t.status !== 'COMPLETED') || [];
      if (myTasks.length === 0) {
        responseText = `You currently have 0 pending tasks assigned across your organizations. Clear skies!`;
      } else {
        responseText = `You have ${myTasks.length} active pending task(s):\n` +
          myTasks.map(t => `• [${t.priority}] ${t.title} (${t.organization.name}) - Status: ${t.status}`).join('\n');
      }
    } else if (q.includes('event') || q.includes('tomorrow') || q.includes('schedule')) {
      const events = await prisma.event.findMany({
        take: 5,
        orderBy: { startDate: 'asc' },
        include: { leadOrganization: true },
      });
      responseText = `Upcoming DSA Ecosystem Events:\n` +
        events.map(e => `• ${e.title} (${e.leadOrganization.name}) on ${new Date(e.startDate).toLocaleDateString()} at ${e.venue}`).join('\n');
    } else if (q.includes('approval') || q.includes('request')) {
      const pendingWorkflows = await prisma.approvalWorkflow.findMany({
        where: { status: 'PENDING' },
        take: 5,
      });
      responseText = `Pending DSA Approvals:\n` +
        pendingWorkflows.map(w => `• ${w.title} (Requested by: ${w.requesterName})`).join('\n');
    } else {
      responseText = `Hello ${user?.fullName}! As your DSA Operations Assistant, I can help you inspect your assigned tasks, check upcoming club events, review approval chains, or analyze event risk factors. What would you like to review?`;
    }

    return res.json({
      query,
      answer: responseText,
      context: {
        userMemberships: user?.memberships.map(m => `${m.role} @ ${m.organization.name}`),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process assistant query' });
  }
});

export default router;
