import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dsa_ecosystem_super_secret_jwt_key_2026_milan';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dsa_ecosystem_refresh_secret_key_2026_milan';

export interface TokenPayload {
  userId: string;
  email: string;
  fullName: string;
}

export function generateTokens(payload: TokenPayload) {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
}
