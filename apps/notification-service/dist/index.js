import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
const app = express();
const PORT = process.env.PORT || 3004;
app.use(cors());
app.use(express.json());
// ── Health Check ────────────────────────────
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'notification',
        timestamp: new Date().toISOString(),
    });
});
// ── Not Implemented Stub ────────────────────
app.use('*', (_req, res) => {
    res.status(501).json({
        error: 'Not implemented',
        service: 'notification'
    });
});
app.listen(PORT, () => {
    console.log(`🔔 Notification Service (stub) running on port ${PORT}`);
});
