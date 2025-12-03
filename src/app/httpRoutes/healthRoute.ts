import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Route de santé pour vérifier que le serveur est opérationnel
 * GET /health
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'octi-realtime-backend',
  });
});

export default router;

