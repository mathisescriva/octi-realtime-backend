import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Route racine - Affiche les routes disponibles
 * GET /
 */
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    service: 'octi-realtime-backend',
    version: '1.0.0',
    status: 'ok',
    endpoints: {
      health: 'GET /health',
      session: 'GET /api/session',
      ragSearch: 'POST /api/rag/search',
      websocket: 'WS /ws/realtime',
    },
  });
});

/**
 * Route de santé pour vérifier que le serveur est opérationnel
 * GET /health
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'octi-realtime-backend',
  });
});

export default router;

