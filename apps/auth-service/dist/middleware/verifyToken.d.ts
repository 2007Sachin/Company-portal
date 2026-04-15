import { Request, Response, NextFunction } from 'express';
/**
 * Express middleware that verifies a Supabase JWT from the Authorization header.
 *
 * On success, attaches the decoded user to `req.user`.
 * On failure, returns 401 Unauthorized.
 */
export declare function verifyToken(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=verifyToken.d.ts.map