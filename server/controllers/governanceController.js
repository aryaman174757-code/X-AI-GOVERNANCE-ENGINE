/**
 * Main Governance Controller
 * Orchestrates the entire governance flow
 */

import { analyzeIntent } from '../services/intentAnalyzer.js';
import { analyzeThreats } from '../services/threatIntel.js';
import { calculateRiskScore, getRiskLevel } from '../services/riskEngine.js';
import { enforce, simulatePolicy, getPolicies } from '../services/enforcement.js';
import { createAuditEntry, getAuditHistory, getAuditStats, getAuditEntry } from '../services/auditLedger.js';
import { exportAuditEntry } from '../services/exportService.js';

/**
 * Process a governance request
 */
export async function processGovernanceRequest(prompt, options = {}) {
  const { policy = 'balanced', userId = 'anonymous', sessionId = null, enableSimulation = false } = options;
  
  try {
    // Step 1: Intent Decomposition
    const intent = await analyzeIntent(prompt);
    
    // Step 2: Threat Intelligence
    const threatResult = await analyzeThreats(prompt);
    
    // Step 3: Risk Scoring
    const riskResult = calculateRiskScore(prompt, intent, threatResult);
    
    // Step 4: Enforcement
    const enforcement = enforce(riskResult.totalScore, policy);
    
    // Step 5: Prepare response
    const response = {
      success: true,
      prompt,
      intent,
      riskScore: riskResult.totalScore,
      riskBreakdown: riskResult.breakdown,
      riskLevel: getRiskLevel(riskResult.totalScore),
      threatScore: threatResult.threatScore,
      matchedThreats: threatResult.matchedPatterns,
      decision: enforcement.decision,
      reason: enforcement.reason,
      policy,
      timestamp: new Date().toISOString()
    };
    
    // Step 6: Simulation mode (if enabled)
    if (enableSimulation) {
      response.simulation = await simulatePolicy(prompt, intent, threatResult);
    }
    
    // Step 7: Create audit entry
    const auditEntry = await createAuditEntry({
      prompt,
      intent,
      riskScore: riskResult.totalScore,
      threatScore: threatResult.threatScore,
      decision: enforcement.decision,
      policy,
      simulation: enableSimulation ? response.simulation : {},
      matchedThreats: threatResult.matchedPatterns,
      userId,
      sessionId
    });
    
    response.auditId = auditEntry.id;
    
    return response;
  } catch (error) {
    console.error('Governance processing error:', error);
    return {
      success: false,
      error: error.message,
      decision: 'ERROR'
    };
  }
}

/**
 * Process AI response with post-validation
 */
export async function validateResponse(prompt, aiResponse, auditId) {
  try {
    // Analyze the AI response for safety
    const threatResult = await analyzeThreats(aiResponse);
    const intent = await analyzeIntent(aiResponse);
    
    // Calculate response risk
    const responseRisk = calculateRiskScore(aiResponse, intent, threatResult);
    
    // Determine if response is safe
    let isSafe = true;
    let filteredResponse = aiResponse;
    
    if (responseRisk.totalScore > 0.7) {
      isSafe = false;
      filteredResponse = '[Response filtered by governance system due to safety concerns]';
    }
    
    // Update audit entry with response validation
    if (auditId) {
      const { updateAuditEntry } = require('./auditLedger.js');
      await updateAuditEntry(auditId, {
        response: aiResponse,
        responseValidated: true,
        responseRiskScore: responseRisk.totalScore,
        responseSafe: isSafe
      });
    }
    
    return {
      isSafe,
      originalResponse: aiResponse,
      filteredResponse,
      responseRiskScore: responseRisk.totalScore,
      matchedThreats: threatResult.matchedPatterns
    };
  } catch (error) {
    console.error('Response validation error:', error);
    return {
      isSafe: true,
      originalResponse: aiResponse,
      error: error.message
    };
  }
}

/**
 * Get governance history
 */
export async function getHistory(options = {}) {
  return getAuditHistory(options);
}

/**
 * Get governance statistics
 */
export async function getStats() {
  return getAuditStats();
}

/**
 * Export audit entry
 */
export async function exportReport(auditId, format = 'pdf') {
  const entry = await getAuditEntry(auditId);
  
  if (!entry.success) {
    return { success: false, error: 'Audit entry not found' };
  }
  
  return exportAuditEntry(entry.entry, format);
}

/**
 * Get available policies
 */
export function getAvailablePolicies() {
  return getPolicies();
}

export default {
  processGovernanceRequest,
  validateResponse,
  getHistory,
  getStats,
  exportReport,
  getAvailablePolicies
};