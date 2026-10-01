import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@civicpulse/shared';
import { env } from '../config/env.js';
import { UserModel } from '../models/User.js';

export interface AuthUserPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  departmentId?: string;
  teamId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

/**
 * Extract JWT access token from request.
 * Priority: Authorization Bearer header → HttpOnly cookie.
 */
function extractToken(req: Request): string | null {
  // 1. Check Authorization header (legacy / API clients)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  // 2. Check HttpOnly cookie
  const cookieToken = (req as any).cookies?.civicpulse_access_token;
  if (cookieToken) {
    return cookieToken;
  }
  return null;
}

/**
 * Authentication middleware that verifies JWT access token.
 * Accepts token from Authorization header or HttpOnly cookie.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. No access token provided.',
      },
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid authentication token',
      },
    });
  }
}

/**
 * Optional authentication middleware.
 * Verifies JWT token if present and populates req.user.
 * If token is omitted or invalid, execution proceeds with req.user undefined.
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = extractToken(req);
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
  } catch {
    // Silently continue without authenticated user
  }
  next();
}

/**
 * Role-Based Access Control (RBAC) middleware.
 * Verifies that the authenticated user possesses one of the allowed roles.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
        },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Forbidden: role '${req.user.role}' lacks permission for this action. Allowed: ${allowedRoles.join(', ')}`,
        },
      });
      return;
    }

    next();
  };
}
