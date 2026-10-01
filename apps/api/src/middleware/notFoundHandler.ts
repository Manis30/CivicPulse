import { Request, Response } from 'express';
import { NotFoundError } from '../utils/errors.js';

export function notFoundHandler(req: Request, res: Response) {
  throw new NotFoundError(`Endpoint not found: ${req.method} ${req.originalUrl}`);
}
