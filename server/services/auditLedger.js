/**
 * Audit Ledger Service
 * Complete logging and history management with Firestore
 */

import { db } from '../models/firebase.js';
import { v4 as uuidv4 } from 'uuid';

// In-memory fallback when Firestore is unavailable
let inMemoryLedger = [];
const MAX_MEMORY_ENTRIES = 100;

/**
 * Create audit entry
 */
export async function createAuditEntry(entry) {
  const auditEntry = {
    id: uuidv4(),
    prompt: entry.prompt,
    intent: entry.intent || {},
    riskScore: entry.riskScore || 0,
    threatScore: entry.threatScore || 0,
    decision: entry.decision || 'ALLOW',
    policy: entry.policy || 'balanced',
    timestamp: new Date().toISOString(),
    simulation: entry.simulation || {},
    matchedThreats: entry.matchedThreats || [],
    userId: entry.userId || 'anonymous',
    sessionId: entry.sessionId || null,
    response: entry.response || null,
    responseValidated: entry.responseValidated || false,
    responseRiskScore: entry.responseRiskScore || null
  };
  
  try {
    // Try to save to Firestore
    const docRef = await db.collection('audit_ledger').add(auditEntry);
    return { success: true, id: docRef.id, entry: auditEntry };
  } catch (error) {
    console.log('Firestore not available, using in-memory storage');
    // Fallback to in-memory
    inMemoryLedger.unshift(auditEntry);
    if (inMemoryLedger.length > MAX_MEMORY_ENTRIES) {
      inMemoryLedger = inMemoryLedger.slice(0, MAX_MEMORY_ENTRIES);
    }
    return { success: true, id: auditEntry.id, entry: auditEntry, inMemory: true };
  }
}

/**
 * Get audit history with pagination
 */
export async function getAuditHistory(options = {}) {
  const { limit = 50, offset = 0, userId = null, policy = null, decision = null } = options;
  
  try {
    let query = db.collection('audit_ledger').orderBy('timestamp', 'desc');
    
    if (userId) {
      query = query.where('userId', '==', userId);
    }
    if (policy) {
      query = query.where('policy', '==', policy);
    }
    if (decision) {
      query = query.where('decision', '==', decision);
    }
    
    const snapshot = await query.limit(limit).offset(offset).get();
    
    return {
      entries: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      total: snapshot.size,
      hasMore: snapshot.size === limit
    };
  } catch (error) {
    console.log('Firestore not available, using in-memory storage');
    // Fallback
    let filtered = [...inMemoryLedger];
    
    if (userId) {
      filtered = filtered.filter(e => e.userId === userId);
    }
    if (policy) {
      filtered = filtered.filter(e => e.policy === policy);
    }
    if (decision) {
      filtered = filtered.filter(e => e.decision === decision);
    }
    
    return {
      entries: filtered.slice(offset, offset + limit),
      total: filtered.length,
      hasMore: offset + limit < filtered.length
    };
  }
}

/**
 * Get single audit entry
 */
export async function getAuditEntry(id) {
  try {
    const doc = await db.collection('audit_ledger').doc(id).get();
    if (doc.exists) {
      return { success: true, entry: { id: doc.id, ...doc.data() } };
    }
    return { success: false, error: 'Entry not found' };
  } catch (error) {
    // Check in-memory
    const entry = inMemoryLedger.find(e => e.id === id);
    if (entry) {
      return { success: true, entry };
    }
    return { success: false, error: 'Entry not found' };
  }
}

/**
 * Get audit statistics
 */
export async function getAuditStats() {
  try {
    const snapshot = await db.collection('audit_ledger').get();
    const entries = snapshot.docs.map(doc => doc.data());
    return calculateStats(entries);
  } catch (error) {
    console.log('Firestore not available, using in-memory storage');
    return calculateStats(inMemoryLedger);
  }
}

function calculateStats(entries) {
  const total = entries.length;
  const byDecision = {};
  const byPolicy = {};
  const riskScores = [];
  const recentDates = [];
  
  for (const entry of entries) {
    // Count by decision
    byDecision[entry.decision] = (byDecision[entry.decision] || 0) + 1;
    
    // Count by policy
    byPolicy[entry.policy] = (byPolicy[entry.policy] || 0) + 1;
    
    // Collect risk scores
    if (entry.riskScore !== undefined) {
      riskScores.push(entry.riskScore);
    }
    
    // Collect dates for trend
    if (entry.timestamp) {
      const date = entry.timestamp.split('T')[0];
      if (!recentDates.includes(date)) {
        recentDates.push(date);
      }
    }
  }
  
  // Calculate average risk score
  const avgRiskScore = riskScores.length > 0
    ? riskScores.reduce((a, b) => a + b, 0) / riskScores.length
    : 0;
  
  return {
    total,
    byDecision,
    byPolicy,
    avgRiskScore: parseFloat(avgRiskScore.toFixed(2)),
    recentDates: recentDates.slice(-7)
  };
}

/**
 * Update audit entry (e.g., add response validation)
 */
export async function updateAuditEntry(id, updates) {
  try {
    await db.collection('audit_ledger').doc(id).update(updates);
    return { success: true };
  } catch (error) {
    // Check in-memory
    const index = inMemoryLedger.findIndex(e => e.id === id);
    if (index !== -1) {
      inMemoryLedger[index] = { ...inMemoryLedger[index], ...updates };
      return { success: true };
    }
    return { success: false, error: 'Entry not found' };
  }
}

/**
 * Clear audit history (admin)
 */
export async function clearAuditHistory() {
  try {
    const batch = db.batch();
    const snapshot = await db.collection('audit_ledger').get();
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    return { success: true, deleted: snapshot.size };
  } catch (error) {
    inMemoryLedger = [];
    return { success: true, deleted: 0, inMemory: true };
  }
}

export default {
  createAuditEntry,
  getAuditHistory,
  getAuditEntry,
  getAuditStats,
  updateAuditEntry,
  clearAuditHistory
};