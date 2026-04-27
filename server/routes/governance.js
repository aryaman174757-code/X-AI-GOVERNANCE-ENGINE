/**
 * Governance API Routes
 */

import express from 'express';
import { 
  processGovernanceRequest, 
  validateResponse, 
  getHistory, 
  getStats, 
  exportReport,
  getAvailablePolicies 
} from '../controllers/governanceController.js';

const router = express.Router();

// POST /api/govern - Process a governance request
router.post('/govern', async (req, res) => {
  try {
    const { prompt, policy = 'balanced', userId, sessionId, simulation = false } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const result = await processGovernanceRequest(prompt, {
      policy,
      userId,
      sessionId,
      enableSimulation: simulation
    });
    
    res.json(result);
  } catch (error) {
    console.error('Governance error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/validate - Post-response safety validation
router.post('/validate', async (req, res) => {
  try {
    const { prompt, aiResponse, auditId } = req.body;
    
    if (!aiResponse) {
      return res.status(400).json({ error: 'AI response is required' });
    }
    
    const result = await validateResponse(prompt, aiResponse, auditId);
    res.json(result);
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/history - Get audit history
router.get('/history', async (req, res) => {
  try {
    const { limit = 50, offset = 0, userId, policy, decision } = req.query;
    
    const result = await getHistory({
      limit: parseInt(limit),
      offset: parseInt(offset),
      userId,
      policy,
      decision
    });
    
    res.json(result);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stats - Get governance statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/policies - Get available policies
router.get('/policies', (req, res) => {
  try {
    const policies = getAvailablePolicies();
    res.json(policies);
  } catch (error) {
    console.error('Policies error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/export - Export audit report
router.post('/export', async (req, res) => {
  try {
    const { auditId, format = 'pdf' } = req.body;
    
    if (!auditId) {
      return res.status(400).json({ error: 'Audit ID is required' });
    }
    
    const result = await exportReport(auditId, format);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.data);
    } else {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(Buffer.from(result.data));
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/health - Health check
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

export default router;