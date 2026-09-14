import { Router, Response } from 'express';
import { db } from '../db';
import { authenticateToken, sanitizeUser, AuthenticatedRequest } from '../auth';

const router = Router();

// GET /api/profile
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  res.json(sanitizeUser(user));
});

// PUT /api/profile
router.put('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { name, phone, company, avatarUrl, preferences } = req.body;

  const updates: any = {};
  if (name && name.trim()) updates.name = name.trim();
  if (phone !== undefined) updates.phone = phone.trim();
  if (company !== undefined) updates.company = company.trim();
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl.trim();
  if (preferences) {
    updates.preferences = {
      ...user.preferences,
      ...preferences,
    };
  }

  const updated = db.updateUser(user.id, updates);
  if (!updated) {
    res.status(500).json({ error: 'Failed to update user profile.' });
    return;
  }

  res.json(sanitizeUser(updated));
});

export default router;
