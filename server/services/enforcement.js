/**
 * Enforcement Engine
 * Policy-based decision making with configurable thresholds
 */

// Policy configurations
export const POLICIES = {
  strict: {
    name: 'Strict',
    description: 'Maximum safety - blocks borderline cases',
    thresholds: {
      allow: 0.2,    // R < 0.2: ALLOW
      warn: 0.5,     // 0.2 <= R < 0.5: WARN
      block: 0.5     // R >= 0.5: BLOCK
    }
  },
  balanced: {
    name: 'Balanced',
    description: 'Balanced approach - warns on borderline, blocks high risk',
    thresholds: {
      allow: 0.3,
      warn: 0.6,
      block: 0.6
    }
  },
  open: {
    name: 'Open (Audit)',
    description: 'Audit mode - allows all with logging',
    thresholds: {
      allow: 0.5,
      warn: 0.8,
      block: 0.9
    }
  }
};

/**
 * Make enforcement decision based on risk score and policy
 */
export function enforce(riskScore, policy = 'balanced') {
  const policyConfig = POLICIES[policy] || POLICIES.balanced;
  const { allow, warn, block } = policyConfig.thresholds;
  
  let decision;
  let reason;
  
  if (riskScore < allow) {
    decision = 'ALLOW';
    reason = `Risk score (${riskScore}) is below allow threshold (${allow})`;
  } else if (riskScore < warn) {
    decision = 'WARN';
    reason = `Risk score (${riskScore}) is between allow and warn thresholds (${allow}-${warn})`;
  } else if (riskScore < block) {
    decision = 'WARN';
    reason = `Risk score (${riskScore}) is between warn and block thresholds (${warn}-${block})`;
  } else {
    decision = 'BLOCK';
    reason = `Risk score (${riskScore}) exceeds block threshold (${block})`;
  }
  
  return {
    decision,
    reason,
    policy,
    thresholds: policyConfig.thresholds,
    riskScore
  };
}

/**
 * Run simulation across all policies
 */
export async function simulatePolicy(prompt, intent, threatResult) {
  // Import dynamically to avoid ES module issues
  const { calculateRiskScore } = await import('./riskEngine.js');
  
  const results = {};
  
  for (const policyKey of Object.keys(POLICIES)) {
    const riskResult = calculateRiskScore(prompt, intent, threatResult);
    const enforcement = enforce(riskResult.totalScore, policyKey);
    results[policyKey] = enforcement.decision;
  }
  
  return results;
}

/**
 * Get available policies
 */
export function getPolicies() {
  return POLICIES;
}

/**
 * Validate policy exists
 */
export function isValidPolicy(policy) {
  return policy in POLICIES;
}

export default {
  enforce,
  simulatePolicy,
  getPolicies,
  isValidPolicy,
  POLICIES
};