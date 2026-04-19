import { Request, Response, NextFunction } from 'express';
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
export declare function verifyToken(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=verifyToken.d.ts.map