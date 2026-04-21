import { Router } from 'express';
import { getSupabase } from '../lib/supabase.js';
import { verifyToken } from '../middleware/verifyToken.js';
export const authRouter = Router();
// ─────────────────────────────────────────────
// POST /auth/login
// ─────────────────────────────────────────────
authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const supabase = getSupabase();
        // Sign in via Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            res.status(401).json({ error: error.message });
            return;
        }
        const user = data.user;
        const session = data.session;
        res.json({
            token: session.access_token,
            refresh_token: session.refresh_token,
            user: {
                id: user.id || '',
                email: user.email || '',
                role: user.user_metadata?.role || 'candidate',
                created_at: user.created_at || new Date().toISOString(),
            },
        });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ─────────────────────────────────────────────
// POST /auth/signup
// ─────────────────────────────────────────────
authRouter.post('/signup', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const userRole = role === 'recruiter' ? 'recruiter' : 'candidate';
        const supabase = getSupabase();
        // Create user in Supabase Auth
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // auto-confirm for now
            user_metadata: { role: userRole },
        });
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        const user = data.user;
        // Insert a row into public.users table
        const { error: insertError } = await supabase
            .from('users')
            .insert({
            id: user.id,
            email: user.email,
            role: userRole,
            created_at: new Date().toISOString(),
        });
        if (insertError) {
            console.error('Failed to insert user row:', insertError);
            // Don't fail signup if the users table insert fails — the auth user exists
        }
        // Sign in to get a session/token
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (signInError || !signInData.session) {
            // User was created but sign-in failed — still return success
            res.status(201).json({
                token: null,
                user: {
                    id: user.id,
                    email: user.email,
                    role: userRole,
                    created_at: user.created_at,
                },
            });
            return;
        }
        res.status(201).json({
            token: signInData.session.access_token,
            refresh_token: signInData.session.refresh_token,
            user: {
                id: user.id,
                email: user.email,
                role: userRole,
                created_at: user.created_at,
            },
        });
    }
    catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ─────────────────────────────────────────────
// POST /auth/logout
// ─────────────────────────────────────────────
authRouter.post('/logout', verifyToken, async (req, res) => {
    try {
        const supabase = getSupabase();
        const userId = req.user.id;
        // Sign out the user from Supabase (invalidate all sessions)
        const { error } = await supabase.auth.admin.signOut(userId);
        if (error) {
            console.error('Logout error:', error);
            // Still return success — the token is already being discarded client-side
        }
        res.json({ success: true });
    }
    catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ─────────────────────────────────────────────
// GET /auth/me
// ─────────────────────────────────────────────
authRouter.get('/me', verifyToken, async (req, res) => {
    try {
        const user = req.user;
        // Optionally enrich with profile data from the users table
        const supabase = getSupabase();
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
        res.json({
            user: profile || user,
        });
    }
    catch (err) {
        console.error('Get me error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ─────────────────────────────────────────────
// POST /auth/refresh
// ─────────────────────────────────────────────
authRouter.post('/refresh', async (req, res) => {
    try {
        const { refresh_token } = req.body;
        if (!refresh_token) {
            res.status(400).json({ error: 'refresh_token is required' });
            return;
        }
        const supabase = getSupabase();
        const { data, error } = await supabase.auth.refreshSession({
            refresh_token,
        });
        if (error || !data.session) {
            res.status(401).json({ error: error?.message || 'Failed to refresh token' });
            return;
        }
        res.json({
            token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            user: {
                id: data.user.id,
                email: data.user.email,
                role: data.user.user_metadata?.role || 'candidate',
                created_at: data.user.created_at,
            },
        });
    }
    catch (err) {
        console.error('Refresh error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=auth.js.map