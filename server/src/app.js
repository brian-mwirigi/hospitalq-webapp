import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes.js';
import queueRoutes from './routes/queue.routes.js';
import departmentRoutes from './routes/department.routes.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';

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
      data: { name: 'HospitalQ API' },
      message: 'HospitalQ API is running',
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/queue', queueRoutes);
  app.use('/api/departments', departmentRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
