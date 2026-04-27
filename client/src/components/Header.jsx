import { useState, useEffect } from 'react'
import { Menu, Shield, Activity, Clock, User, Bell, Search, Command } from 'lucide-react'

export default function Header({ toggleSidebar }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="h-18 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2.5 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg tracking-wide">AI Governance Console</h2>
            <p className="text-gray-500 text-xs flex items-center gap-2">
              <Activity className="w-3 h-3 text-green-500 animate-pulse" /> 
              Real-time safety monitoring
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-800/50 rounded-xl px-4 py-2 border border-gray-700/50 hover:border-gray-600 transition-colors cursor-pointer">
          <Search className="w-4 h-4 text-gray-500" />
          <span className="text-gray-500 text-sm">Search...</span>
          <div className="flex items-center gap-1 ml-4">
            <kbd className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-400">⌘</kbd>
            <kbd className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-400">K</kbd>
          </div>
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Status indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-green-500 text-sm font-medium">Active</span>
        </div>

        {/* Time */}
        <div className="hidden lg:block text-right bg-gray-800/30 rounded-xl px-4 py-2 border border-gray-800">
          <p className="text-white text-sm font-mono flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-gray-500 text-xs">
            {time.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* User avatar */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 cursor-pointer hover:scale-105 transition-transform">
          <User className="w-5 h-5 text-white" />
        </div>
      </div>
    </header>
  )
}