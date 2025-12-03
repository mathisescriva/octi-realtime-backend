import express, { Express } from 'express';
import healthRoute from './httpRoutes/healthRoute';
import { logger } from '../config/logger';

/**
 * Configure et retourne l'application Express
 */
export function createApp(): Express {
  const app = express();

  // Middleware pour parser JSON
  app.use(express.json());

  // Routes HTTP
  app.use('/', healthRoute);

  // Log des requêtes
  app.use((req, _res, next) => {
    logger.debug({ method: req.method, path: req.path }, 'Requête HTTP');
    next();
  });

  return app;
}

