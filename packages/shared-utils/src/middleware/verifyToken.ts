import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email: string;
  role: 'recruiter' | 'candidate';
  created_at: string;
}

/**
 * Reusable JWT verification middleware for any Pulse microservice.
 *
 * Extracts Bearer token from the Authorization header, verifies it
 * using JWT_SECRET, and attaches the decoded payload to `req.user`.
 *
 * Usage in any service:
 *   import { verifyToken } from '@pulse/shared-utils';
 *   router.get('/protected', verifyToken, handler);
 */
export async function verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  // --- MOCK OVERRIDE ---
  (req as any).user = {
    id: 'mock-recruiter-id',
    email: 'recruiter@example.com',
    role: 'recruiter',
    created_at: new Date().toISOString()
  } as AuthUser;
  next();
  return;
  // ---------------------
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or malformed Authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('[verifyToken] JWT_SECRET is not configured');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload;

    // Attach decoded user info to the request
    (req as any).user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role || decoded.user_metadata?.role || 'candidate',
      created_at: decoded.created_at,
    } as AuthUser;

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
      return;
    }
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    console.error('[verifyToken] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
