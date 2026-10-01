import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  const requestId = req.id || 'unknown';

  if (err instanceof z.ZodError) {
    const issues = err.errors.map((e) => `${e.path.join('.') || 'field'}: ${e.message}`).join('; ');
    logger.warn('Request Validation Error', {
      requestId,
      issues,
      details: err.errors,
    });

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Validation failed: ${issues}`,
        requestId,
        details: err.errors,
      },
    });
  }
  
  if (err instanceof AppError) {
    logger.warn('Operational Application Error', {
      requestId,
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      details: err.details,
    });

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        requestId,
        details: err.details,
      },
    });
  }

  // Unhandled / Internal System Error
  logger.error('Unhandled System Exception', err, {
    requestId,
    method: req.method,
    path: req.originalUrl,
  });

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: env.NODE_ENV === 'production' 
        ? 'An unexpected operational error occurred on the server.' 
        : err.message,
      requestId,
    },
  });
}
