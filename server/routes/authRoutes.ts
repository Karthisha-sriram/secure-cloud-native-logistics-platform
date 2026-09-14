import { Router, Response } from 'express';
import { db, hashPassword } from '../db';
import { signJwt, authenticateToken, sanitizeUser, AuthenticatedRequest } from '../auth';

const router = Router();

// POST /api/auth/login
router.post('/login', (req, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: 'VALIDATION_ERROR',
      message: 'Email and password are required.',
      path: '/api/auth/login',
    });
    return;
  }

  const user = db.findUserByEmail(email);
  const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown Client';

  if (!user || user.passwordHash !== hashPassword(password)) {
    db.recordSecurityEvent({
      userEmail: email,
      eventType: 'LOGIN_FAILURE',
      ipAddress,
      userAgent,
      details: 'Invalid email or password credentials provided.',
    });

    res.status(401).json({
      timestamp: new Date().toISOString(),
      status: 401,
      error: 'UNAUTHORIZED',
      message: 'Invalid credentials. Please verify your email and password.',
      path: '/api/auth/login',
    });
    return;
  }

  if (user.status !== 'ACTIVE') {
    res.status(403).json({
      timestamp: new Date().toISOString(),
      status: 403,
      error: 'ACCOUNT_LOCKED',
      message: 'Your account is locked or disabled. Contact system administrator.',
      path: '/api/auth/login',
    });
    return;
  }

  // Update user last login
  const now = new Date().toISOString();
  db.updateUser(user.id, { lastLoginAt: now });

  // Generate JWT token
  const token = signJwt({
    sub: user.id,
    email: user.email,
    role: user.role,
    customerId: user.customerId,
  });

  // Track user session
  const sessionId = `SESS-${Date.now()}`;
  db.createOrUpdateSession({
    id: sessionId,
    userId: user.id,
    userEmail: user.email,
    ipAddress,
    device: userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser',
    lastActive: now,
    isCurrent: true,
  });

  // Record security audit
  db.recordSecurityEvent({
    userId: user.id,
    userEmail: user.email,
    eventType: 'LOGIN_SUCCESS',
    ipAddress,
    userAgent,
    details: `Successful login with role [${user.role}].`,
  });

  res.json({
    token,
    user: sanitizeUser(user),
    expiresInMs: 86400000,
  });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthenticated' });
    return;
  }
  res.json({
    user: sanitizeUser(req.user),
  });
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (req.user) {
    db.recordSecurityEvent({
      userId: req.user.id,
      userEmail: req.user.email,
      eventType: 'SESSION_REVOKED',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Unknown',
      details: 'User initiated voluntary sign out.',
    });
  }
  res.json({ status: 'LOGGED_OUT', message: 'Session successfully terminated.' });
});

// POST /api/auth/refresh
router.post('/refresh', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthenticated' });
    return;
  }

  const newToken = signJwt({
    sub: req.user.id,
    email: req.user.email,
    role: req.user.role,
    customerId: req.user.customerId,
  });

  res.json({
    token: newToken,
    user: sanitizeUser(req.user),
  });
});

export default router;
