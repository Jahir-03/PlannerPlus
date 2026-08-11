import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import orgsRoutes from './routes/orgs.routes.js';
import tasksRoutes from './routes/tasks.routes.js';
import eventsRoutes from './routes/events.routes.js';
import approvalsRoutes from './routes/approvals.routes.js';
import resourcesRoutes from './routes/resources.routes.js';
import aiRoutes from './routes/ai.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`⚡ DSA Ecosystem API Server running on port ${PORT}`);
});
