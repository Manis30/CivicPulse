import { Request, Response, NextFunction } from 'express';

/**
 * Strips keys containing '$' or '.' to prevent NoSQL operator injection in user input.
 */
function cleanObject(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(cleanObject);
  }

  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    // Drop keys that attempt Mongo operator injection or dotted path pollution
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    cleaned[key] = cleanObject(value);
  }
  return cleaned;
}

export function sanitizeInputMiddleware(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = cleanObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = cleanObject(req.query) as any;
  }
  if (req.params && typeof req.params === 'object') {
    req.params = cleanObject(req.params) as any;
  }
  next();
}
