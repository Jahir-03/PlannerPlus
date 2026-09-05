import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';

import authRoutes from './routes/auth.routes.js';
import orgsRoutes from './routes/orgs.routes.js';
import tasksRoutes from './routes/tasks.routes.js';
import eventsRoutes from './routes/events.routes.js';
import approvalsRoutes from './routes/approvals.routes.js';
import resourcesRoutes from './routes/resources.routes.js';
import aiRoutes from './routes/ai.routes.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api', apiLimiter);

// API Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'DSA Ecosystem API' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orgs', orgsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/approvals', approvalsRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/ai', aiRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(env.PORT, () => {
  console.log(`⚡ DSA Ecosystem API Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});
