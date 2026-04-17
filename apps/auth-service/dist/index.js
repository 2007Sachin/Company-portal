"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = require("./routes/auth");
const health_1 = require("./routes/health");
dotenv_1.default.config({ path: '../../.env' });
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// ── Middleware ─────────────────────────────
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json());
// ── Request logging ───────────────────────
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// ── Routes ────────────────────────────────
app.use('/auth', auth_1.authRouter);
app.use('/', health_1.healthRouter);
// ── Start ─────────────────────────────────
app.listen(PORT, () => {
    console.log(`🔐 Auth Service running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
});
exports.default = app;
//# sourceMappingURL=index.js.map