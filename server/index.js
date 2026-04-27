/**
 * X-AI Governance Engine Server
 * Main entry point for the backend API
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import governanceRoutes from './routes/governance.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api', governanceRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'X-AI Governance Engine',
    version: '1.0.0',
    description: 'Production-grade AI governance gateway with safety, explainability, and compliance',
    endpoints: {
      govern: 'POST /api/govern - Process governance request',
      validate: 'POST /api/validate - Post-response validation',
      history: 'GET /api/history - Get audit history',
      stats: 'GET /api/stats - Get governance statistics',
      policies: 'GET /api/policies - Get available policies',
      export: 'POST /api/export - Export compliance report',
      health: 'GET /api/health - Health check'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║          X-AI GOVERNANCE ENGINE - SERVER                  ║
╠═══════════════════════════════════════════════════════════╣
║  Server running on: http://localhost:${PORT}                ║
║  API Base URL: http://localhost:${PORT}/api                  ║
║  Health Check: http://localhost:${PORT}/api/health          ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;