import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { generateTokens, verifyRefreshToken } from '../config/jwt.js';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../utils/auditLogger.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  studentId: z.string().optional(),
  phone: z.string().optional(),
  college: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        studentId: data.studentId,
        phone: data.phone,
        college: data.college || 'SRM Institute of Science and Technology (KTR)',
      },
    });

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
    });

    await logAuditEvent({
      userId: user.id,
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: user.id,
      details: `User registered with email ${user.email}`,
      ipAddress: req.ip,
    });

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        studentId: user.studentId,
        college: user.college,
      },
      ...tokens,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated. Contact DSA Admin.' });
    }

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
    });

    await logAuditEvent({
      userId: user.id,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user.id,
      details: `Successful login for ${user.email}`,
      ipAddress: req.ip,
    });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        studentId: user.studentId,
        college: user.college,
        memberships: user.memberships.map(m => ({
          orgId: m.organizationId,
          orgName: m.organization.name,
          orgCode: m.organization.code,
          orgType: m.organization.type,
          role: m.role,
          title: m.title,
        })),
      },
      ...tokens,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.get('/me', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        studentId: user.studentId,
        phone: user.phone,
        college: user.college,
        avatarUrl: user.avatarUrl,
        memberships: user.memberships.map(m => ({
          id: m.id,
          orgId: m.organizationId,
          orgName: m.organization.name,
          orgCode: m.organization.code,
          orgType: m.organization.type,
          role: m.role,
          title: m.title,
        })),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const tokens = generateTokens({
      userId: payload.userId,
      email: payload.email,
      fullName: payload.fullName,
    });
    return res.json(tokens);
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

export default router;
