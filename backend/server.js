import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

import profileRoutes from './src/routes/profile.routes.js';
import matchRoutes from './src/routes/match.routes.js';
import materialsRoutes from './src/routes/materials.routes.js';
import documentsRoutes from './src/routes/documents.routes.js';
import opportunitiesRoutes from './src/routes/opportunities.routes.js';
import scraperRoutes from './src/routes/scraper.routes.js';
import strategyRoutes from './src/routes/strategy.routes.js';
import historyRoutes from './src/routes/history.routes.js';
import dashboardRoutes from './src/routes/dashboard.routes.js';
import interviewRoutes from './src/routes/interview.routes.js';
import discoveryRoutes from './src/routes/discovery.routes.js';
import { errorHandler } from './src/middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// General API rate limit: 200 req per 15 min per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Strict AI rate limit: 30 AI calls per 15 min per IP
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI rate limit reached. Please wait a few minutes before making more AI requests.' }
});

app.use('/api', generalLimiter);

// Health check (no auth required)
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// All API routes
app.use('/api/profile', profileRoutes);
app.use('/api/match', aiLimiter, matchRoutes);
app.use('/api/materials', aiLimiter, materialsRoutes);
app.use('/api/documents', aiLimiter, documentsRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/scraper', aiLimiter, scraperRoutes);
app.use('/api/strategy', aiLimiter, strategyRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/interview', aiLimiter, interviewRoutes);
app.use('/api/discovery', aiLimiter, discoveryRoutes);

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});
