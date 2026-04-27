import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { Shield, AlertTriangle, CheckCircle, XCircle, Activity, TrendingUp, Eye, Lock, Zap, Brain, Globe, Server, Cpu, Database, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'

// Mock data for charts
const riskTrendData = [
  { time: '00:00', score: 0.2 },
  { time: '04:00', score: 0.15 },
  { time: '08:00', score: 0.35 },
  { time: '12:00', score: 0.45 },
  { time: '16:00', score: 0.3 },
  { time: '20:00', score: 0.25 },
  { time: '24:00', score: 0.2 },
]

const policyDistribution = [
  { name: 'Allow', value: 65, color: '#22c55e' },
  { name: 'Warn', value: 25, color: '#f59e0b' },
  { name: 'Block', value: 10, color: '#ef4444' },
]

const threatCategoryData = [
  { category: 'Jailbreak', count: 15 },
  { category: 'Prompt Injection', count: 12 },
  { category: 'Adversarial', count: 8 },
  { category: 'Unsafe Template', count: 5 },
]

const recentActivity = [
  { id: 1, type: 'block', prompt: 'Ignore previous instructions...', time: '2m ago' },
  { id: 2, type: 'allow', prompt: 'Explain neural networks', time: '5m ago' },
  { id: 3, type: 'warn', prompt: 'How to bypass security...', time: '8m ago' },
  { id: 4, type: 'allow', prompt: 'Write fibonacci function', time: '12m ago' },
  { id: 5, type: 'block', prompt: 'Create phishing website', time: '15m ago' },
]

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRequests: 1247,
    blocked: 23,
    warned: 156,
    allowed: 1068,
    avgRiskScore: 0.28,
    activeThreats: 5
  })

  const [activeTab, setActiveTab] = useState('overview')

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'block': return <ShieldX className="w-4 h-4 text-red-500" />
      case 'warn': return <ShieldAlert className="w-4 h-4 text-yellow-500" />
      case 'allow': return <ShieldCheck className="w-4 h-4 text-green-500" />
      default: return <Shield className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header Stats with Glowing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={item} className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-gray-800/80 backdrop-blur-xl rounded-xl p-5 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Requests</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.totalRequests.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-green-500 text-sm mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12% from yesterday
            </p>
          </div>
        </motion.div>

        <motion.div variants={item} className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-gray-800/80 backdrop-blur-xl rounded-xl p-5 border border-gray-700/50 hover:border-red-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Blocked</p>
                <p className="text-3xl font-bold text-red-500 mt-1">{stats.blocked}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-2">High-risk prompts detected</p>
          </div>
        </motion.div>

        <motion.div variants={item} className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-gray-800/80 backdrop-blur-xl rounded-xl p-5 border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Warnings</p>
                <p className="text-3xl font-bold text-yellow-500 mt-1">{stats.warned}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-2">Borderline cases flagged</p>
          </div>
        </motion.div>

        <motion.div variants={item} className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-gray-800/80 backdrop-blur-xl rounded-xl p-5 border border-gray-700/50 hover:border-green-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Allowed</p>
                <p className="text-3xl font-bold text-green-500 mt-1">{stats.allowed}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-2">Safe prompts processed</p>
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Risk Trend Chart */}
          <motion.div variants={item} className="bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Risk Score Trend</h3>
                  <p className="text-gray-400 text-xs">Real-time monitoring</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-gray-400 text-sm">Live</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskTrendData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      backdropBlur: '10px'
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="url(#colorScore)" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Two Column Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Policy Distribution */}
            <motion.div variants={item} className="bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Decisions</h3>
                </div>
              </div>
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={policyDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {policyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {policyDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-400 text-sm">{item.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Threat Categories */}
            <motion.div variants={item} className="bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Threats</h3>
                </div>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={threatCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="category" stroke="#9ca3af" fontSize={10} />
                    <YAxis stroke="#9ca3af" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Side Panel - System Status & Activity */}
        <div className="space-y-6">
          {/* System Status */}
          <motion.div variants={item} className="bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">System Status</h3>
                <p className="text-gray-400 text-xs">Infrastructure health</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300 text-sm">API Server</span>
                </div>
                <span className="text-green-500 text-sm">Online</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300 text-sm">Database</span>
                </div>
                <span className="text-green-500 text-sm">Connected</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300 text-sm">AI Engine</span>
                </div>
                <span className="text-green-500 text-sm">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="text-gray-300 text-sm">Threat Intel</span>
                </div>
                <span className="text-green-500 text-sm">Synced</span>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={item} className="bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                <p className="text-gray-400 text-xs">Live feed</p>
              </div>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-2 hover:bg-gray-700/30 rounded-lg transition-colors">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{activity.prompt}</p>
                    <p className="text-gray-500 text-xs">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={item} className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30">
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Quick Stats</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">28%</p>
                <p className="text-gray-400 text-xs">Avg Risk</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">5</p>
                <p className="text-gray-400 text-xs">Active Threats</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">99.2%</p>
                <p className="text-gray-400 text-xs">Uptime</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">12ms</p>
                <p className="text-gray-400 text-xs">Latency</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}