import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../../models/User.js';
import { env } from '../../config/env.js';
import {
  RegisterSchema,
  LoginSchema,
  RefreshTokenSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from './authSchemas.js';
import { logger } from '../../utils/logger.js';
import { AuthUserPayload } from '../../middleware/authMiddleware.js';

const ACCESS_TOKEN_EXPIRY = '2h';
const REFRESH_TOKEN_EXPIRY = '7d';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function generateTokens(payload: AuthUserPayload) {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign({ id: payload.id, email: payload.email }, env.JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
  return { accessToken, refreshToken };
}

/**
 * Set HttpOnly auth cookies on the response.
 */
function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  const cookieBase: import('express').CookieOptions = {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'lax',
    path: '/',
  };
  // Access token: 2 hours
  res.cookie('civicpulse_access_token', accessToken, {
    ...cookieBase,
    maxAge: 2 * 60 * 60 * 1000,
  });
  // Refresh token: 7 days
  res.cookie('civicpulse_refresh_token', refreshToken, {
    ...cookieBase,
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

/**
 * Clear auth cookies from the response.
 */
function clearAuthCookies(res: Response): void {
  res.clearCookie('civicpulse_access_token', { path: '/' });
  res.clearCookie('civicpulse_refresh_token', { path: '/api/auth/refresh' });
}

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const parseResult = RegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid registration details',
          details: parseResult.error.format(),
        },
      });
      return;
    }

    const { name, email, password, phone, role, departmentId, teamId } = parseResult.data;

    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'A user with this email address already exists.',
        },
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      phone,
      role,
      departmentId,
      teamId,
      isActive: true,
      notificationPreferences: {
        channels: ['IN_APP', 'EMAIL'],
        alertOnCritical: true,
        weeklyDigest: false,
      },
    });

    const tokenPayload: AuthUserPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      departmentId: user.departmentId?.toString(),
      teamId: user.teamId?.toString(),
    };

    const { accessToken, refreshToken } = generateTokens(tokenPayload);
    setAuthCookies(res, accessToken, refreshToken);

    logger.info(`User registered successfully: ${user.email} (${user.role})`);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          departmentId: user.departmentId,
          teamId: user.teamId,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
      },
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const parseResult = LoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password required',
          details: parseResult.error.format(),
        },
      });
      return;
    }

    const { email, password } = parseResult.data;

    const user = await UserModel.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_DEACTIVATED',
          message: 'This account has been deactivated.',
        },
      });
      return;
    }

    user.lastLoginAt = new Date();
    await user.save();

    const tokenPayload: AuthUserPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      departmentId: user.departmentId?.toString(),
      teamId: user.teamId?.toString(),
    };

    const { accessToken, refreshToken } = generateTokens(tokenPayload);
    setAuthCookies(res, accessToken, refreshToken);

    logger.info(`User logged in: ${user.email} (${user.role})`);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          departmentId: user.departmentId,
          teamId: user.teamId,
          avatarUrl: user.avatarUrl,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
        },
        accessToken,
        refreshToken,
      },
    });
  }

  async refresh(req: Request, res: Response): Promise<void> {
    // Accept refresh token from body or HttpOnly cookie
    const bodyResult = RefreshTokenSchema.safeParse(req.body);
    const refreshToken = bodyResult.success
      ? bodyResult.data.refreshToken
      : (req as any).cookies?.civicpulse_refresh_token;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Refresh token is required.',
        },
      });
      return;
    }

    try {
      const decoded = jwt.verify(refreshToken, env.JWT_SECRET) as { id: string; email: string };
      const user = await UserModel.findById(decoded.id);

      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'User associated with token no longer exists or is inactive.',
          },
        });
        return;
      }

      const tokenPayload: AuthUserPayload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
        departmentId: user.departmentId?.toString(),
        teamId: user.teamId?.toString(),
      };

      const tokens = generateTokens(tokenPayload);
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

      res.json({
        success: true,
        data: tokens,
      });
    } catch {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid or expired refresh token.',
        },
      });
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    clearAuthCookies(res);
    res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const parseResult = ForgotPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid email is required',
        },
      });
      return;
    }

    const { email } = parseResult.data;
    const user = await UserModel.findOne({ email: email.toLowerCase() });

    // Always respond with success to avoid email enumeration
    if (!user) {
      res.json({
        success: true,
        message: 'If an account exists with this email, a password recovery token has been issued.',
      });
      return;
    }

    const resetToken = jwt.sign({ id: user._id.toString(), purpose: 'password_reset' }, env.JWT_SECRET, {
      expiresIn: '1h',
    });

    logger.info(`Password reset requested for ${user.email}. Token generated.`);

    res.json({
      success: true,
      message: 'If an account exists with this email, a password recovery token has been issued.',
      data: {
        resetToken, // Returned in dev/local mode for straightforward testing
      },
    });
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const parseResult = ResetPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Token and new password (min 6 chars) required.',
        },
      });
      return;
    }

    const { token, newPassword } = parseResult.data;

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; purpose?: string };
      if (decoded.purpose !== 'password_reset') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_RESET_TOKEN',
            message: 'Invalid password reset token.',
          },
        });
        return;
      }

      const user = await UserModel.findById(decoded.id);
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User no longer exists.',
          },
        });
        return;
      }

      user.passwordHash = await bcrypt.hash(newPassword, 10);
      await user.save();

      logger.info(`Password reset completed for ${user.email}`);

      res.json({
        success: true,
        message: 'Password has been updated successfully. Please sign in with your new password.',
      });
    } catch {
      res.status(400).json({
        success: false,
        error: {
          code: 'EXPIRED_OR_INVALID_TOKEN',
          message: 'The password reset token is invalid or expired.',
        },
      });
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
      return;
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        departmentId: user.departmentId,
        teamId: user.teamId,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    });
  }
}

export const authController = new AuthController();
