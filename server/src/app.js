import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { readFileSync } from 'fs';
import path from 'path';
import { parse } from 'yaml';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth.js';
import queueRoutes from './routes/queue.js';
import departmentRoutes from './routes/depts.js';
import analyticsRoutes from './routes/analytics.js';
import quickfundiRoutes from './routes/quickfundi.js';
import { requireDb, notFound, errorHandler } from './middleware.js';
import { requireApiKey, rateLimit } from './security.js';
import { isDbReady } from './db.js';

export function createApp(ioHolder) {
  const app = express();

  const openapiCandidates = [
    new URL('../../openapi.yaml', import.meta.url),
    path.join(process.cwd(), 'openapi.yaml'),
  ];
  let openapi = null;
  for (const candidate of openapiCandidates) {
    try {
      openapi = parse(readFileSync(candidate, 'utf8'));
      break;
    } catch {
      openapi = null;
    }
  }

  app.use((req, res, next) => {
    if (req.path.startsWith('/docs')) return next();
    return helmet()(req, res, next);
  });
  if (openapi) {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));
  }
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(morgan('dev'));
  app.use(express.json());

  app.use((req, res, next) => {
    req.io = ioHolder?.io || null;
    next();
  });

  app.get('/', (req, res) => {
    res.json({
      success: true,
      data: {
        name: 'HospitalQ API',
        dbConnected: isDbReady(),
      },
      message: isDbReady() ? 'HospitalQ API is running' : 'API running but MongoDB is NOT connected',
    });
  });

  app.use('/api', requireApiKey);
  app.use('/api', rateLimit);
  app.use('/api/quickfundi', quickfundiRoutes);
  app.use('/api', requireDb);
  app.use('/api/auth', authRoutes);
  app.use('/api/queue', queueRoutes);
  app.use('/api/departments', departmentRoutes);
  app.use('/api/analytics', analyticsRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}