import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db, hashPassword } from './db';
import { UserRecord, Role } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'c2VjdXJlX2Nsb3VkX25hdGl2ZV9sb2dpc3RpY3NfcGxhdGZvcm1fc3VwZXJfc2VjcmV0X2tleV8yMDI2';
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: Role;
  customerId?: string;
  iat: number;
  exp: number;
}

// Enterprise HMAC-SHA256 JWT Generator & Verifier
export function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Date.now();
  const fullPayload: JwtPayload = {
    ...payload,
    iat: Math.floor(now / 1000),
    exp: Math.floor((now + TOKEN_EXPIRY_MS) / 1000),
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${b64Header}.${b64Payload}`)
    .digest('base64url');

  return `${b64Header}.${b64Payload}.${signature}`;
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [b64Header, b64Payload, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${b64Header}.${b64Payload}`)
      .digest('base64url');

    if (expectedSig !== signature) return null;

    const payload: JwtPayload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf-8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return payload;
  } catch (err) {
    return null;
  }
}

// Express Request augmentation
export interface AuthenticatedRequest extends Request {
  user?: UserRecord;
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({
      timestamp: new Date().toISOString(),
      status: 401,
      error: 'UNAUTHORIZED',
      message: 'Full authentication is required to access this resource.',
      path: req.originalUrl,
    });
    return;
  }

  const payload = verifyJwt(token);
  if (!payload) {
    res.status(401).json({
      timestamp: new Date().toISOString(),
      status: 401,
      error: 'INVALID_TOKEN',
      message: 'JWT token is expired or signature is invalid.',
      path: req.originalUrl,
    });
    return;
  }

  const user = db.findUserById(payload.sub);
  if (!user || user.status !== 'ACTIVE') {
    res.status(401).json({
      timestamp: new Date().toISOString(),
      status: 401,
      error: 'USER_DISABLED',
      message: 'User account is locked, disabled, or does not exist.',
      path: req.originalUrl,
    });
    return;
  }

  req.user = user;
  next();
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        timestamp: new Date().toISOString(),
        status: 401,
        error: 'UNAUTHORIZED',
        message: 'Authentication required.',
        path: req.originalUrl,
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        timestamp: new Date().toISOString(),
        status: 403,
        error: 'FORBIDDEN',
        message: `Access denied. Role [${req.user.role}] lacks required permission. Required one of: [${allowedRoles.join(', ')}].`,
        path: req.originalUrl,
      });
      return;
    }

    next();
  };
}

// Helper to strip sensitive passwordHash before sending to client
export function sanitizeUser(user: UserRecord) {
  const { passwordHash, ...safe } = user;
  return safe;
}
