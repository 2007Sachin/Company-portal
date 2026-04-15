"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_1 = require("../lib/supabase");
/**
 * Express middleware that verifies a Supabase JWT from the Authorization header.
 *
 * On success, attaches the decoded user to `req.user`.
 * On failure, returns 401 Unauthorized.
 */
async function verifyToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Missing or malformed Authorization header' });
            return;
        }
        const token = authHeader.split(' ')[1];
        // Verify the JWT using the Supabase JWT secret
        const jwtSecret = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET is not configured');
            res.status(500).json({ error: 'Server configuration error' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        // Fetch the full user object from Supabase
        const supabase = (0, supabase_1.getSupabase)();
        const { data: { user }, error } = await supabase.auth.admin.getUserById(decoded.sub);
        if (error || !user) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }
        // Attach to request for downstream handlers
        req.user = {
            id: user.id,
            email: user.email,
            role: user.user_metadata?.role || 'candidate',
            created_at: user.created_at,
        };
        next();
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ error: 'Token expired' });
            return;
        }
        if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        console.error('Auth middleware error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=verifyToken.js.map