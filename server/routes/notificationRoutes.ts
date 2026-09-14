import { Router, Response } from 'express';
import { db } from '../db';
import { authenticateToken, AuthenticatedRequest } from '../auth';

const router = Router();

// GET /api/notifications
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const notifications = db.getNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  res.json({
    notifications,
    unreadCount,
    total: notifications.length,
  });
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const success = db.markNotificationRead(req.params.id);
  if (!success) {
    res.status(404).json({
      timestamp: new Date().toISOString(),
      status: 404,
      error: 'NOT_FOUND',
      message: `Notification ${req.params.id} not found.`,
      path: req.originalUrl,
    });
    return;
  }
  res.json({ status: 'UPDATED', id: req.params.id, read: true });
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticateToken, (_req: AuthenticatedRequest, res: Response) => {
  db.markAllNotificationsRead();
  res.json({ status: 'ALL_READ', message: 'All notifications marked as read.' });
});

export default router;
