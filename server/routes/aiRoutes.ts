import { Router, Response } from 'express';
import { askLogisticsAssistant } from '../ai';
import { authenticateToken, AuthenticatedRequest } from '../auth';

const router = Router();

// POST /api/ai/chat
router.post('/chat', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { query } = req.body;
  if (!query || !query.trim()) {
    res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: 'VALIDATION_ERROR',
      message: 'Query parameter is required.',
      path: req.originalUrl,
    });
    return;
  }

  try {
    const answer = await askLogisticsAssistant(query.trim(), req.user!);
    res.json({
      query: query.trim(),
      response: answer,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('AI assistant error:', err);
    res.status(500).json({
      timestamp: new Date().toISOString(),
      status: 500,
      error: 'AI_SERVICE_ERROR',
      message: 'Logistics AI Assistant was unable to process query.',
      path: req.originalUrl,
    });
  }
});

export default router;
