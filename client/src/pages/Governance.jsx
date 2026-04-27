import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, Download, Play, Info, Zap, Brain, Lock, FileText, Code, Cpu, Globe } from 'lucide-react'

const policies = [
  { id: 'strict', name: 'Strict', description: 'Maximum safety - blocks borderline cases', threshold: 0.2 },
  { id: 'balanced', name: 'Balanced', description: 'Balanced approach - warns on borderline, blocks high risk', threshold: 0.6 },
  { id: 'open', name: 'Open (Audit)', description: 'Audit mode - allows all with logging', threshold: 0.9 },
]

export default function Governance() {
  const [prompt, setPrompt] = useState('')
  const [policy, setPolicy] = useState('balanced')
  const [simulationMode, setSimulationMode] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/govern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          policy,
          simulation: simulationMode
        })
      })
      
      const data = await response.json()
      setResult(data)
      setShowExplanation(true)
    } catch (error) {
      console.error('Error:', error)
      // Mock response for demo
      setResult({
        success: true,
        prompt,
        intent: { goal: 'Content creation', method: 'Code generation', target: 'General' },
        riskScore: 0.15,
        riskBreakdown: {
          keyword: { score: 0.1, weight: 0.25, contribution: 0.025 },
          intent: { score: 0.2, weight: 0.25, contribution: 0.05 },
          contextual: { score: 0.1, weight: 0.25, contribution: 0.025 },
          threat: { score: 0.2, weight: 0.25, contribution: 0.05 }
        },
        riskLevel: { level: 'LOW', color: 'success' },
        threatScore: 0.2,
        matchedThreats: [],
        decision: 'ALLOW',
        reason: 'Risk score is below allow threshold',
        policy,
        simulation: simulationMode ? { strict: 'WARN', balanced: 'ALLOW', open: 'ALLOW' } : undefined
      })
    }
    setLoading(false)
  }

  const handleExport = async (format) => {
    if (!result?.auditId) return
    
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditId: result.auditId, format })
      })
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `governance-report.${format}`
      a.click()
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  const getDecisionIcon = (decision) => {
    switch (decision) {
      case 'ALLOW': return <CheckCircle className="w-8 h-8 text-green-500" />
      case 'WARN': return <AlertTriangle className="w-8 h-8 text-yellow-500" />
      case 'BLOCK': return <XCircle className="w-8 h-8 text-red-500" />
      default: return <Shield className="w-8 h-8 text-gray-500" />
    }
  }

  const getDecisionColor = (decision) => {
    switch (decision) {
      case 'ALLOW': return 'bg-green-500/20 text-green-500 border-green-500'
      case 'WARN': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500'
      case 'BLOCK': return 'bg-red-500/20 text-red-500 border-red-500'
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Governance Console</h1>
          <p className="text-gray-400">Test prompts against AI safety policies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter Prompt to Analyze
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type your prompt here..."
              className="w-full h-40 bg-gray-700 text-white rounded-lg p-4 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                {/* Policy Selector */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Policy</label>
                  <select
                    value={policy}
                    onChange={(e) => setPolicy(e.target.value)}
                    className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:ring-2 focus:ring-blue-500"
                  >
                    {policies.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Simulation Toggle */}
                <div className="flex items-center gap-2">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only"
                        checked={simulationMode}
                        onChange={() => setSimulationMode(!simulationMode)}
                      />
                      <div className={`w-10 h-6 rounded-full transition ${simulationMode ? 'bg-blue-600' : 'bg-gray-600'}`}></div>
                      <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition ${simulationMode ? 'left-5' : 'left-1'}`}></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-300">Simulation Mode</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {loading ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Analyze
              </button>
            </div>
          </form>

          {/* Results Section */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
              >
                {/* Decision Banner */}
                <div className={`p-6 flex items-center justify-between ${getDecisionColor(result.decision)}`}>
                  <div className="flex items-center gap-4">
                    {getDecisionIcon(result.decision)}
                    <div>
                      <h3 className="text-xl font-bold">{result.decision}</h3>
                      <p className="text-sm opacity-80">{result.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{Math.round(result.riskScore * 100)}%</p>
                    <p className="text-sm opacity-80">Risk Score</p>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                  {/* Intent Breakdown */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Intent Breakdown</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-700 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Goal</p>
                        <p className="text-white font-medium">{result.intent?.goal}</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Method</p>
                        <p className="text-white font-medium">{result.intent?.method}</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Target</p>
                        <p className="text-white font-medium">{result.intent?.target}</p>
                      </div>
                    </div>
                  </div>

                  {/* Risk Breakdown */}
                  {showExplanation && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                        <Eye className="w-4 h-4" /> Risk Analysis
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(result.riskBreakdown || {}).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-3">
                            <span className="text-gray-400 text-sm capitalize w-24">{key}</span>
                            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${value.score * 100}%` }}
                              />
                            </div>
                            <span className="text-white text-sm w-12">{Math.round(value.score * 100)}%</span>
                            <span className="text-gray-500 text-xs w-16">×{value.weight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Simulation Results */}
                  {result.simulation && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Policy Simulation</h4>
                      <div className="flex gap-3">
                        {Object.entries(result.simulation).map(([policyName, decision]) => (
                          <div key={policyName} className="flex-1 bg-gray-700 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-400 capitalize">{policyName}</p>
                            <p className={`text-lg font-bold ${
                              decision === 'ALLOW' ? 'text-green-500' :
                              decision === 'WARN' ? 'text-yellow-500' : 'text-red-500'
                            }`}>{decision}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Export Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => handleExport('pdf')}
                      className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      <Download className="w-4 h-4" /> PDF
                    </button>
                    <button
                      onClick={() => handleExport('json')}
                      className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      <Download className="w-4 h-4" /> JSON
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Policy Thresholds</h3>
            <div className="space-y-3">
              {policies.map((p) => (
                <div 
                  key={p.id}
                  className={`p-3 rounded-lg border ${
                    policy === p.id ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{p.name}</span>
                    <span className="text-gray-400 text-sm">Block: ≥{Math.round(p.threshold * 100)}%</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">{p.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Formula</h3>
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300">
              R = w₁x₁ + w₂x₂ + w₃x₃ + w₄x₄
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              <li><span className="text-blue-400">x₁</span> - Keyword Risk</li>
              <li><span className="text-blue-400">x₂</span> - Intent Risk</li>
              <li><span className="text-blue-400">x₃</span> - Contextual Risk</li>
              <li><span className="text-blue-400">x₄</span> - Threat Score</li>
            </ul>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" /> Quick Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Use simulation mode to test prompts across all policies</li>
              <li>• Export reports for compliance documentation</li>
              <li>• View detailed risk breakdown for explainability</li>
              <li>• Threat patterns update every 5 minutes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}