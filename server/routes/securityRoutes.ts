import { Router, Response } from 'express';
import { db, hashPassword } from '../db';
import { authenticateToken, AuthenticatedRequest } from '../auth';

const router = Router();

// GET /api/security/events
router.get('/events', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let events = db.getSecurityEvents();

  // Role constraint: Customers only see their own security events
  if (user.role === 'CUSTOMER') {
    events = events.filter(e => e.userId === user.id || e.userEmail === user.email);
  }

  res.json({
    events,
    total: events.length,
  });
});

// GET /api/security/sessions
router.get('/sessions', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const sessions = db.getSessions(user.id);
  res.json(sessions);
});

// DELETE /api/security/sessions/:id
router.delete('/sessions/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const success = db.revokeSession(req.params.id);
  if (!success) {
    res.status(404).json({
      timestamp: new Date().toISOString(),
      status: 404,
      error: 'NOT_FOUND',
      message: 'Session not found.',
      path: req.originalUrl,
    });
    return;
  }
  res.json({ status: 'REVOKED', sessionId: req.params.id });
});

// POST /api/security/logout-all
router.post('/logout-all', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  db.revokeAllSessions(user.id);
  db.recordSecurityEvent({
    userId: user.id,
    userEmail: user.email,
    eventType: 'SESSION_REVOKED',
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Browser Client',
    details: 'User revoked all active sessions.',
  });
  res.json({ status: 'ALL_SESSIONS_REVOKED' });
});

// POST /api/security/change-password
router.post('/change-password', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: 'VALIDATION_ERROR',
      message: 'Both current password and new password are required.',
      path: req.originalUrl,
    });
    return;
  }

  if (user.passwordHash !== hashPassword(currentPassword)) {
    db.recordSecurityEvent({
      userId: user.id,
      userEmail: user.email,
      eventType: 'UNAUTHORIZED_ACCESS',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser',
      details: 'Password change rejected: Incorrect current password.',
    });

    res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: 'INVALID_CREDENTIALS',
      message: 'The current password you entered is incorrect.',
      path: req.originalUrl,
    });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: 'VALIDATION_ERROR',
      message: 'New password must be at least 8 characters long.',
      path: req.originalUrl,
    });
    return;
  }

  const newHash = hashPassword(newPassword);
  db.updateUser(user.id, { passwordHash: newHash });

  db.recordSecurityEvent({
    userId: user.id,
    userEmail: user.email,
    eventType: 'PASSWORD_CHANGED',
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Browser',
    details: 'User successfully updated password.',
  });

  res.json({
    status: 'PASSWORD_UPDATED',
    message: 'Your password has been securely updated.',
  });
});

export default router;
