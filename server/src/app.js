import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import queueRoutes from './routes/queueRoutes.js';
import departmentRoutes from './routes/deptRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { requireDb } from './middleware/checkDb.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { isDbReady } from './config/db.js';

export function createApp(ioHolder) {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
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

  app.use('/api', requireDb);
  app.use('/api/auth', authRoutes);
  app.use('/api/queue', queueRoutes);
  app.use('/api/departments', departmentRoutes);
  app.use('/api/analytics', analyticsRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
