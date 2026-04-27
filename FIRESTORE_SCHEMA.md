# Firestore Schema for X-AI Governance Engine

## Collections

### 1. `threat_patterns`
Stores threat detection patterns for real-time intelligence.

**Document Structure:**
```json
{
  "id": "string",
  "pattern": "string",
  "category": "string (jailbreak|prompt_injection|adversarial|unsafe_template)",
  "severity": "number (0.0-1.0)",
  "description": "string",
  "createdAt": "timestamp"
}
```

**Example Documents:**
```json
{
  "id": "pattern_1",
  "pattern": "ignore previous instructions",
  "category": "jailbreak",
  "severity": 0.9,
  "description": "Attempt to override system instructions",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

### 2. `audit_ledger`
Stores complete governance audit logs.

**Document Structure:**
```json
{
  "id": "string (UUID)",
  "prompt": "string",
  "intent": {
    "goal": "string",
    "method": "string",
    "target": "string"
  },
  "riskScore": "number (0.0-1.0)",
  "threatScore": "number (0.0-1.0)",
  "decision": "string (ALLOW|WARN|BLOCK)",
  "policy": "string (strict|balanced|open)",
  "timestamp": "timestamp",
  "simulation": {
    "strict": "string",
    "balanced": "string",
    "open": "string"
  },
  "matchedThreats": [
    {
      "id": "string",
      "pattern": "string",
      "category": "string",
      "severity": "number",
      "description": "string"
    }
  ],
  "userId": "string",
  "sessionId": "string",
  "response": "string (nullable)",
  "responseValidated": "boolean",
  "responseRiskScore": "number (nullable)",
  "responseSafe": "boolean"
}
```

**Example Document:**
```json
{
  "id": "audit_abc123",
  "prompt": "Write a function to calculate fibonacci numbers",
  "intent": {
    "goal": "Content creation",
    "method": "Code generation",
    "target": "General"
  },
  "riskScore": 0.15,
  "threatScore": 0.1,
  "decision": "ALLOW",
  "policy": "balanced",
  "timestamp": "2024-01-15T10:30:00Z",
  "simulation": {},
  "matchedThreats": [],
  "userId": "anonymous",
  "sessionId": null,
  "response": null,
  "responseValidated": false,
  "responseRiskScore": null,
  "responseSafe": null
}
```

---

### 3. `policies` (Optional)
Stores custom policy configurations.

**Document Structure:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "thresholds": {
    "allow": "number",
    "warn": "number",
    "block": "number"
  },
  "isActive": "boolean",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## Indexes

Create the following Firestore indexes for optimal query performance:

1. **audit_ledger collection:**
   - `timestamp` (DESC)
   - `userId` (ASC), `timestamp` (DESC)
   - `policy` (ASC), `timestamp` (DESC)
   - `decision` (ASC), `timestamp` (DESC)

2. **threat_patterns collection:**
   - `category` (ASC)
   - `severity` (DESC)

---

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Threat patterns - read-only for governance service
    match /threat_patterns/{patternId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }
    
    // Audit ledger - append-only for governance service
    match /audit_ledger/{auditId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth.token.admin == true;
      allow delete: if request.auth.token.admin == true;
    }
    
    // Policies - admin only
    match /policies/{policyId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

---

## Data Flow

```
User Input → Intent Decomposition → Threat Intelligence → Risk Scoring → Enforcement → AI Response → Post-Validation → Logging → Export Option
    ↓              ↓                    ↓                  ↓            ↓            ↓              ↓              ↓           ↓
 Firestore    Gemini API           Firestore        Calculation   Policy      Gemini API    Firestore     Firestore    PDF/JSON
 Collection   (Intent)            Collection       (Engine)     (Engine)    (Response)   (Validate)   (Audit)     (Export)
```