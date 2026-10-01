import { Request, Response } from 'express';
import { getDatabaseStatus } from '../../config/database.js';
import { verifyRequiredIndexes } from '../../config/verifyIndexes.js';

export async function getHealth(req: Request, res: Response) {
  const dbStatus = await getDatabaseStatus();

  res.status(200).json({
    status: 'ok',
    service: 'civicpulse-api',
    timestamp: new Date().toISOString(),
    version: '2.0.0-phase2',
    environment: process.env.NODE_ENV || 'development',
    requestId: req.id,
    database: {
      state: dbStatus.state,
      databaseName: dbStatus.databaseName,
      latencyMs: dbStatus.latencyMs,
    },
  });
}

export async function getDbHealth(req: Request, res: Response) {
  const dbStatus = await getDatabaseStatus();
  let indexStatus = undefined;

  if (dbStatus.state === 'CONNECTED') {
    indexStatus = await verifyRequiredIndexes();
  }

  res.status(200).json({
    status: dbStatus.state === 'CONNECTED' ? 'ok' : 'degraded',
    service: 'civicpulse-db',
    timestamp: new Date().toISOString(),
    requestId: req.id,
    connection: dbStatus,
    indexes: indexStatus,
  });
}
