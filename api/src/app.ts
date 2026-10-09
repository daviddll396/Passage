import express from 'express';
import { checkDatabase } from './db.js';
import { createBudgetRoutes } from './budget.js';

export function createApp() {
  const app = express();
  const frontendOrigins = new Set([
    ...(process.env.FRONTEND_ORIGIN ?? 'http://127.0.0.1:3000')
      .split(',').map((origin) => origin.trim()).filter(Boolean),
    ...(process.env.NODE_ENV === 'production' ? [] : ['http://localhost:3000']),
  ]);

  app.use((request, response, next) => {
    const origin = request.get('origin');
    response.vary('Origin');
    if (origin && frontendOrigins.has(origin)) {
      response.set('Access-Control-Allow-Origin', origin);
      response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      response.set('Access-Control-Allow-Headers', 'Content-Type, X-Passage-Question, X-Passage-History');
      response.set('Access-Control-Expose-Headers', 'Retry-After');
    }
    if (request.method === 'OPTIONS') {
      if (origin && !frontendOrigins.has(origin)) return response.sendStatus(403);
      return response.sendStatus(204);
    }
    if (origin && !frontendOrigins.has(origin) && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      return response.sendStatus(403);
    }
    next();
  });

  app.use(express.json({ limit: '10kb' }));

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.get('/ready', async (_request, response) => {
    try {
      await checkDatabase();
      response.json({ status: 'ready', database: 'ok' });
    } catch {
      response.status(503).json({ status: 'not_ready', database: 'unavailable' });
    }
  });

  app.use('/budget', createBudgetRoutes());
  return app;
}
