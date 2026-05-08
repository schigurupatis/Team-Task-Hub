import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth.types';
import { ApiResponse } from '../types/task.types';

const JWT_SECRET = process.env.JWT_SECRET || 'team-task-hub-jwt-secret-2026';

// Extend Express Request type to include user after JWT verification
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// ─── requireAuth middleware ───────────────────────────────────────────────────
// Add this to any route that needs authentication
// Usage: router.get('/protected', requireAuth, controller)
export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // Step 1: Get token from Authorization header
  // Frontend sends: "Authorization: Bearer eyJhbGci..."
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const response: ApiResponse = {
      success: false,
      error:   'Unauthorized',
      message: 'No token provided. Please login first.',
    };
    res.status(401).json(response);
    return;
  }

  // Step 2: Extract the token (remove "Bearer " prefix)
  const token = authHeader.split(' ')[1];

  // Step 3: Verify the token
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    // Step 4: Attach decoded user info to request — available in all controllers
    req.user = decoded;
    next(); // proceed to controller
  } catch (err) {
    // Token is invalid, expired, or tampered with
    const response: ApiResponse = {
      success: false,
      error:   'Unauthorized',
      message: 'Token is invalid or expired. Please login again.',
    };
    res.status(401).json(response);
  }
};

// ─── optionalAuth middleware ──────────────────────────────────────────────────
// Use when route works both with and without auth
// If token present and valid: attaches req.user
// If no token: continues without req.user (no error)
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      // Invalid token — just ignore and continue without user
    }
  }
  next();
};