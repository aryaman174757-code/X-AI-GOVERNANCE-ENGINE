/**
 * Threat Intelligence System
 * Real-time threat pattern detection with Firestore integration
 */

import { db } from '../models/firebase.js';

// In-memory cache for threat patterns
let threatPatternsCache = [];
let lastCacheUpdate = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Default threat patterns (fallback when Firestore is unavailable)
const DEFAULT_THREAT_PATTERNS = [
  {
    id: 'default_1',
    pattern: 'ignore previous instructions',
    category: 'jailbreak',
    severity: 0.9,
    description: 'Attempt to override system instructions'
  },
  {
    id: 'default_2',
    pattern: 'ignore all rules',
    category: 'jailbreak',
    severity: 0.95,
    description: 'Direct rule override attempt'
  },
  {
    id: 'default_3',
    pattern: 'system prompt',
    category: 'prompt_injection',
    severity: 0.8,
    description: 'Attempt to access system prompts'
  },
  {
    id: 'default_4',
    pattern: 'developer mode',
    category: 'jailbreak',
    severity: 0.85,
    description: 'Request for unrestricted mode'
  },
  {
    id: 'default_5',
    pattern: 'bypass safety',
    category: 'adversarial',
    severity: 0.9,
    description: 'Safety mechanism bypass attempt'
  },
  {
    id: 'default_6',
    pattern: 'new instructions',
    category: 'prompt_injection',
    severity: 0.75,
    description: 'Injection of new instructions'
  },
  {
    id: 'default_7',
    pattern: 'forget your instructions',
    category: 'jailbreak',
    severity: 0.85,
    description: 'Memory manipulation attempt'
  },
  {
    id: 'default_8',
    pattern: 'DAN',
    category: 'jailbreak',
    severity: 0.95,
    description: 'DAN (Do Anything Now) jailbreak'
  },
  {
    id: 'default_9',
    pattern: 'roleplay as',
    category: 'unsafe_template',
    severity: 0.7,
    description: 'Roleplay manipulation attempt'
  },
  {
    id: 'default_10',
    pattern: 'pretend to be',
    category: 'unsafe_template',
    severity: 0.75,
    description: 'Identity impersonation attempt'
  },
  {
    id: 'default_11',
    pattern: 'you are now',
    category: 'prompt_injection',
    severity: 0.8,
    description: 'Personality override attempt'
  },
  {
    id: 'default_12',
    pattern: 'disregard safety',
    category: 'adversarial',
    severity: 0.95,
    description: 'Direct safety disregard command'
  },
  {
    id: 'default_13',
    pattern: 'jailbreak',
    category: 'jailbreak',
    severity: 0.9,
    description: 'Explicit jailbreak request'
  },
  {
    id: 'default_14',
    pattern: 'unfiltered',
    category: 'adversarial',
    severity: 0.85,
    description: 'Request for unfiltered content'
  },
  {
    id: 'default_15',
    pattern: 'no restrictions',
    category: 'jailbreak',
    severity: 0.9,
    description: 'Removal of restrictions request'
  }
];

/**
 * Load threat patterns from Firestore or use cache
 */
async function loadThreatPatterns() {
  const now = Date.now();
  
  // Return cached patterns if still valid
  if (threatPatternsCache.length > 0 && (now - lastCacheUpdate) < CACHE_TTL) {
    return threatPatternsCache;
  }
  
  try {
    // Try to load from Firestore
    const threatPatternsRef = db.collection('threat_patterns');
    const snapshot = await threatPatternsRef.get();
    
    if (!snapshot.empty) {
      threatPatternsCache = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      lastCacheUpdate = now;
      console.log(`Loaded ${threatPatternsCache.length} threat patterns from Firestore`);
    } else {
      // Use default patterns and optionally seed Firestore
      threatPatternsCache = DEFAULT_THREAT_PATTERNS;
      lastCacheUpdate = now;
      console.log('Using default threat patterns');
    }
  } catch (error) {
    console.log('Firestore not available, using default patterns:', error.message);
    threatPatternsCache = DEFAULT_THREAT_PATTERNS;
    lastCacheUpdate = now;
  }
  
  return threatPatternsCache;
}

/**
 * Analyze prompt for threat patterns
 */
export async function analyzeThreats(prompt) {
  const patterns = await loadThreatPatterns();
  const lowerPrompt = prompt.toLowerCase();
  
  const matchedPatterns = [];
  let maxSeverity = 0;
  
  for (const pattern of patterns) {
    if (lowerPrompt.includes(pattern.pattern.toLowerCase())) {
      matchedPatterns.push({
        id: pattern.id,
        pattern: pattern.pattern,
        category: pattern.category,
        severity: pattern.severity,
        description: pattern.description
      });
      
      if (pattern.severity > maxSeverity) {
        maxSeverity = pattern.severity;
      }
    }
  }
  
  // Calculate threat score (0-1)
  const threatScore = matchedPatterns.length > 0 
    ? Math.min(1, matchedPatterns.reduce((sum, p) => sum + p.severity, 0) / matchedPatterns.length)
    : 0;
  
  return {
    threatScore: parseFloat(threatScore.toFixed(2)),
    matchedPatterns,
    totalMatches: matchedPatterns.length,
    categories: [...new Set(matchedPatterns.map(p => p.category))]
  };
}

/**
 * Get all threat patterns (for admin)
 */
export async function getAllThreatPatterns() {
  return loadThreatPatterns();
}

/**
 * Add new threat pattern (for admin)
 */
export async function addThreatPattern(pattern) {
  try {
    const docRef = await db.collection('threat_patterns').add({
      ...pattern,
      createdAt: new Date().toISOString()
    });
    
    // Invalidate cache
    threatPatternsCache = [];
    lastCacheUpdate = 0;
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding threat pattern:', error);
    return { success: false, error: error.message };
  }
}

export default {
  analyzeThreats,
  getAllThreatPatterns,
  addThreatPattern,
  loadThreatPatterns
};