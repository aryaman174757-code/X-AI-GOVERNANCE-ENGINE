/**
 * API Service
 * Frontend service for communicating with the backend
 */

const API_BASE = '/api';

export async function processGovernance(prompt, options = {}) {
  const { policy = 'balanced', simulation = false } = options;
  
  const response = await fetch(`${API_BASE}/govern`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, policy, simulation })
  });
  
  if (!response.ok) {
    throw new Error('Failed to process governance request');
  }
  
  return response.json();
}

export async function validateResponse(prompt, aiResponse, auditId) {
  const response = await fetch(`${API_BASE}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, aiResponse, auditId })
  });
  
  if (!response.ok) {
    throw new Error('Failed to validate response');
  }
  
  return response.json();
}

export async function getHistory(options = {}) {
  const { limit = 50, offset = 0, userId, policy, decision } = options;
  
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString()
  });
  
  if (userId) params.append('userId', userId);
  if (policy) params.append('policy', policy);
  if (decision) params.append('decision', decision);
  
  const response = await fetch(`${API_BASE}/history?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch history');
  }
  
  return response.json();
}

export async function getStats() {
  const response = await fetch(`${API_BASE}/stats`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }
  
  return response.json();
}

export async function getPolicies() {
  const response = await fetch(`${API_BASE}/policies`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch policies');
  }
  
  return response.json();
}

export async function exportReport(auditId, format = 'pdf') {
  const response = await fetch(`${API_BASE}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ auditId, format })
  });
  
  if (!response.ok) {
    throw new Error('Failed to export report');
  }
  
  return response.blob();
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE}/health`);
  
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  
  return response.json();
}

export default {
  processGovernance,
  validateResponse,
  getHistory,
  getStats,
  getPolicies,
  exportReport,
  checkHealth
};