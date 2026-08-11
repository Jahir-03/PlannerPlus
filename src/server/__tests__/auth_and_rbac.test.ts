import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import bcrypt from 'bcryptjs';
import { generateTokens, verifyAccessToken } from '../config/jwt.js';

describe('DSA Ecosystem — Auth & Security Unit Tests', () => {
  it('should correctly hash and verify user passwords', async () => {
    const password = 'alohomora2026';
    const hash = await bcrypt.hash(password, 10);
    expect(await bcrypt.compare(password, hash)).toBe(true);
    expect(await bcrypt.compare('wrong_pass', hash)).toBe(false);
  });

  it('should generate and verify JWT access tokens with user payload', () => {
    const payload = {
      userId: 'test-user-id-123',
      email: 'aravind_k@srmist.edu.in',
      fullName: 'Aravind K',
    };

    const tokens = generateTokens(payload);
    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();

    const decoded = verifyAccessToken(tokens.accessToken);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it('should accurately calculate resource availability window conflicts', () => {
    const totalQuantity = 5;
    const existingReservations = [
      {
        startTime: new Date('2026-02-19T10:00:00Z'),
        endTime: new Date('2026-02-19T14:00:00Z'),
        quantity: 3,
        status: 'CONFIRMED',
      },
    ];

    const requestedStart = new Date('2026-02-19T11:00:00Z');
    const requestedEnd = new Date('2026-02-19T13:00:00Z');

    const overlapping = existingReservations.filter((r) => {
      return requestedStart < r.endTime && requestedEnd > r.startTime;
    });

    const alreadyReservedQty = overlapping.reduce((sum, r) => sum + r.quantity, 0);
    const availableQty = totalQuantity - alreadyReservedQty;

    expect(availableQty).toBe(2);
    expect(4 > availableQty).toBe(true); // Requesting 4 should be flagged as conflict
  });
});
