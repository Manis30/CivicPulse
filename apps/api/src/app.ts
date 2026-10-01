import path from 'path';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import healthRoutes from './modules/health/healthRoutes.js';
import incidentRoutes from './modules/incidents/incidentRoutes.js';
import reportRoutes from './modules/reports/reportRoutes.js';
import departmentRoutes from './modules/departments/departmentRoutes.js';
import teamRoutes from './modules/teams/teamRoutes.js';
import analyticsRoutes from './modules/analytics/analyticsRoutes.js';
import toolRoutes from './modules/tools/toolRoutes.js';
import agentRoutes from './modules/agents/agentRoutes.js';
import orchestrationRoutes from './modules/orchestrations/orchestrationRoutes.js';
import authRoutes from './modules/auth/authRoutes.js';
import evidenceRoutes from './modules/evidence/evidenceRoutes.js';
import workOrderRoutes from './modules/workOrders/workOrderRoutes.js';
import notificationRoutes from './modules/notifications/notificationRoutes.js';
import systemRoutes from './modules/system/systemRoutes.js';
import adminRoutes from './modules/admin/adminRoutes.js';
import { sanitizeInputMiddleware } from './middleware/sanitizeInput.js';

export function createApp() {
  const app = express();

  // Security & standard middlewares
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.use(cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  }));
  app.use(cookieParser());
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Static files for uploaded evidence images
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

  // Tracing, logging, and security sanitization middlewares
  app.use(requestIdMiddleware);
  app.use(requestLogger);
  app.use(sanitizeInputMiddleware);

  // Mount API modules
  app.use('/api', healthRoutes);
  app.use('/api', authRoutes);
  app.use('/api', incidentRoutes);
  app.use('/api', reportRoutes);
  app.use('/api', evidenceRoutes);
  app.use('/api', workOrderRoutes);
  app.use('/api', notificationRoutes);
  app.use('/api', departmentRoutes);
  app.use('/api', teamRoutes);
  app.use('/api', analyticsRoutes);
  app.use('/api', systemRoutes);
  app.use('/api', adminRoutes);
  app.use('/api', toolRoutes);
  app.use('/api/agents', agentRoutes);
  app.use('/api/orchestrations', orchestrationRoutes);

  // 404 & Centralized Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
