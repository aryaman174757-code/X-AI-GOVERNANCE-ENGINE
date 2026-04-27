/**
 * Intent Decomposition Service
 * Converts user prompts into structured intent data using Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const INTENT_PROMPT = `Analyze the following user prompt and decompose it into structured JSON with exactly these fields:
- "goal": The main objective or purpose of the prompt (what the user wants to achieve)
- "method": The approach or technique being requested (how they want to achieve it)
- "target": The subject or entity being affected (who or what is being targeted)

Return ONLY valid JSON, no additional text.`;

export async function analyzeIntent(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent(`${INTENT_PROMPT}\n\nPrompt: "${prompt}"`);
    const response = result.response.text();
    
    // Parse the JSON response
    let intentData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        intentData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // Fallback: create intent from prompt analysis
      intentData = fallbackIntentAnalysis(prompt);
    }
    
    return {
      goal: intentData.goal || 'Unknown',
      method: intentData.method || 'Unknown',
      target: intentData.target || 'Unknown',
      rawResponse: response
    };
  } catch (error) {
    console.error('Intent analysis error:', error);
    return fallbackIntentAnalysis(prompt);
  }
}

function fallbackIntentAnalysis(prompt) {
  // Simple keyword-based fallback analysis
  const lowerPrompt = prompt.toLowerCase();
  
  // Detect goal
  let goal = 'General query';
  if (lowerPrompt.includes('create') || lowerPrompt.includes('generate') || lowerPrompt.includes('write')) {
    goal = 'Content creation';
  } else if (lowerPrompt.includes('explain') || lowerPrompt.includes('what is') || lowerPrompt.includes('how does')) {
    goal = 'Information request';
  } else if (lowerPrompt.includes('fix') || lowerPrompt.includes('debug') || lowerPrompt.includes('error')) {
    goal = 'Problem solving';
  } else if (lowerPrompt.includes('analyze') || lowerPrompt.includes('review') || lowerPrompt.includes('evaluate')) {
    goal = 'Analysis';
  }
  
  // Detect method
  let method = 'Direct query';
  if (lowerPrompt.includes('step by step') || lowerPrompt.includes('tutorial')) {
    method = 'Step-by-step guide';
  } else if (lowerPrompt.includes('code') || lowerPrompt.includes('program')) {
    method = 'Code generation';
  } else if (lowerPrompt.includes('list') || lowerPrompt.includes('summarize')) {
    method = 'Summary/List';
  }
  
  // Detect target
  let target = 'General';
  if (lowerPrompt.includes('system') || lowerPrompt.includes('you') || lowerPrompt.includes('ai')) {
    target = 'AI System';
  } else if (lowerPrompt.includes('user') || lowerPrompt.includes('person')) {
    target = 'User/Person';
  } else if (lowerPrompt.includes('file') || lowerPrompt.includes('data')) {
    target = 'Data/File';
  }
  
  return { goal, method, target };
}

export default { analyzeIntent };