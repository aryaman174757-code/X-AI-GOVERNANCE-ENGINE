/**
 * Risk Scoring Engine
 * Multi-factor risk calculation with weighted scoring
 * 
 * Formula: R = w1*x1 + w2*x2 + w3*x3 + w4*x4
 * Where:
 *   x1: keyword risk
 *   x2: intent risk (from decomposition)
 *   x3: contextual risk
 *   x4: threat intelligence score
 */

// Default weights (can be configured)
const DEFAULT_WEIGHTS = {
  keyword: 0.25,
  intent: 0.25,
  contextual: 0.25,
  threat: 0.25
};

// Risk keywords with severity scores
const RISK_KEYWORDS = {
  high: [
    'hack', 'exploit', 'bypass', 'crack', 'steal', 'malware', 'virus', 'trojan',
    'phishing', 'fraud', 'attack', 'breach', 'infiltrate', 'unauthorized',
    'illegal', 'weapon', 'bomb', 'explosive', 'harm', 'kill', 'suicide',
    'terrorist', 'extremist', 'hate', 'discriminate', 'harass', 'stalk'
  ],
  medium: [
    'manipulate', 'deceive', 'trick', 'fake', 'impersonate', 'copy',
    'reverse engineer', 'decrypt', 'extract', 'scrape', 'spam', 'bot',
    'automate', 'script', 'expose', 'leak', 'reveal', 'private',
    'sensitive', 'confidential', 'secret', 'classified'
  ],
  low: [
    'question', 'ask', 'help', 'explain', 'understand', 'learn',
    'create', 'build', 'make', 'generate', 'write', 'code', 'program'
  ]
};

// Intent risk mapping
const INTENT_RISK_MAP = {
  'Content creation': 0.2,
  'Information request': 0.1,
  'Problem solving': 0.3,
  'Analysis': 0.2,
  'General query': 0.1,
  'Data extraction': 0.6,
  'System manipulation': 0.8,
  'Security probing': 0.7
};

/**
 * Calculate keyword risk score
 */
function calculateKeywordRisk(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  const words = lowerPrompt.split(/\s+/);
  
  let totalRisk = 0;
  let matchCount = 0;
  
  // Check high risk keywords
  for (const keyword of RISK_KEYWORDS.high) {
    if (lowerPrompt.includes(keyword)) {
      totalRisk += 1.0;
      matchCount++;
    }
  }
  
  // Check medium risk keywords
  for (const keyword of RISK_KEYWORDS.medium) {
    if (lowerPrompt.includes(keyword)) {
      totalRisk += 0.6;
      matchCount++;
    }
  }
  
  // Check low risk keywords
  for (const keyword of RISK_KEYWORDS.low) {
    if (lowerPrompt.includes(keyword)) {
      totalRisk += 0.2;
      matchCount++;
    }
  }
  
  // Normalize to 0-1 range
  if (matchCount === 0) return 0;
  
  const rawScore = Math.min(1, totalRisk / (matchCount * 0.8));
  return parseFloat(rawScore.toFixed(2));
}

/**
 * Calculate intent risk score
 */
function calculateIntentRisk(intent) {
  const goalRisk = INTENT_RISK_MAP[intent.goal] || 0.1;
  const methodRisk = INTENT_RISK_MAP[intent.method] || 0.1;
  const targetRisk = intent.target === 'AI System' ? 0.5 : 0.1;
  
  const avgRisk = (goalRisk + methodRisk + targetRisk) / 3;
  return parseFloat(avgRisk.toFixed(2));
}

/**
 * Calculate contextual risk (based on prompt characteristics)
 */
function calculateContextualRisk(prompt) {
  let risk = 0;
  
  // Check for prompt injection patterns
  const injectionPatterns = [
    /system\s*:/i,
    /instructions\s*:/i,
    /ignore\s+previous/i,
    /new\s+instructions/i,
    /\[\s*INST\s*\]/i,
    /<<.*>>/i,
    /{{.*}}/i
  ];
  
  for (const pattern of injectionPatterns) {
    if (pattern.test(prompt)) {
      risk += 0.3;
    }
  }
  
  // Check for unusual length (potential obfuscation)
  if (prompt.length > 2000) {
    risk += 0.2;
  }
  
  // Check for encoding attempts
  if (/\\x[0-9a-f]{2}/i.test(prompt) || /base64/i.test(prompt)) {
    risk += 0.3;
  }
  
  // Check for roleplay attempts
  if (/act\s+as/i.test(prompt) || /pretend/i.test(prompt) || /roleplay/i.test(prompt)) {
    risk += 0.2;
  }
  
  return parseFloat(Math.min(1, risk).toFixed(2));
}

/**
 * Main risk scoring function
 */
export function calculateRiskScore(prompt, intent, threatResult, customWeights = null) {
  const weights = customWeights || DEFAULT_WEIGHTS;
  
  // Calculate individual risk components
  const x1 = calculateKeywordRisk(prompt);      // keyword risk
  const x2 = calculateIntentRisk(intent);         // intent risk
  const x3 = calculateContextualRisk(prompt);    // contextual risk
  const x4 = threatResult.threatScore;          // threat intelligence score
  
  // Apply weighted formula
  const riskScore = 
    weights.keyword * x1 +
    weights.intent * x2 +
    weights.contextual * x3 +
    weights.threat * x4;
  
  return {
    totalScore: parseFloat(Math.min(1, riskScore).toFixed(2)),
    breakdown: {
      keyword: { score: x1, weight: weights.keyword, contribution: parseFloat((weights.keyword * x1).toFixed(2)) },
      intent: { score: x2, weight: weights.intent, contribution: parseFloat((weights.intent * x2).toFixed(2)) },
      contextual: { score: x3, weight: weights.contextual, contribution: parseFloat((weights.contextual * x3).toFixed(2)) },
      threat: { score: x4, weight: weights.threat, contribution: parseFloat((weights.threat * x4).toFixed(2)) }
    },
    components: { x1, x2, x3, x4 }
  };
}

/**
 * Get risk level label
 */
export function getRiskLevel(score) {
  if (score < 0.3) return { level: 'LOW', color: 'success' };
  if (score < 0.6) return { level: 'MEDIUM', color: 'warning' };
  if (score < 0.8) return { level: 'HIGH', color: 'danger' };
  return { level: 'CRITICAL', color: 'danger' };
}

export default {
  calculateRiskScore,
  getRiskLevel,
  calculateKeywordRisk,
  calculateIntentRisk,
  calculateContextualRisk,
  DEFAULT_WEIGHTS
};