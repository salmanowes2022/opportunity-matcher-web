import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import profileRoutes from './src/routes/profile.routes.js';
import matchRoutes from './src/routes/match.routes.js';
import materialsRoutes from './src/routes/materials.routes.js';
import documentsRoutes from './src/routes/documents.routes.js';
import opportunitiesRoutes from './src/routes/opportunities.routes.js';
import scraperRoutes from './src/routes/scraper.routes.js';
import strategyRoutes from './src/routes/strategy.routes.js';
import historyRoutes from './src/routes/history.routes.js';
import { errorHandler } from './src/middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check (no auth required)
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// All API routes
app.use('/api/profile', profileRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/strategy', strategyRoutes);
app.use('/api/history', historyRoutes);

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});
