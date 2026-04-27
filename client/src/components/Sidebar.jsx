import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Shield, FileText, Zap, Brain, Activity, Settings, ChevronRight, Hexagon } from 'lucide-react'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'governance', label: 'Governance', icon: Shield, path: '/governance' },
  { id: 'history', label: 'Audit History', icon: FileText, path: '/history' },
]

export default function Sidebar({ currentPage, setCurrentPage, isOpen, setIsOpen }) {
  const location = useLocation()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        className={`
          fixed lg:relative z-30 lg:z-0
          w-64 h-full bg-gray-900/95 backdrop-blur-xl border-r border-gray-800
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-gray-800 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl tracking-wide">X-AI</h1>
              <p className="text-gray-400 text-xs font-medium">Governance Engine</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 mt-2">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    onClick={() => setCurrentPage(item.id)}
                    className={`
                      flex items-center gap-3 px-4 py-3.5 rounded-xl
                      transition-all duration-200 group
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white hover:translate-x-1'
                      }
                    `}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                    <span className="font-medium">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* System Info */}
        <div className="absolute bottom-28 left-0 right-0 px-4">
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-400 text-xs font-medium">System Status</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-green-500 text-sm font-medium">All Systems Operational</span>
            </div>
          </div>
        </div>

        {/* Policy Selector */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-gray-900/50">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-3 border border-gray-700/50">
            <p className="text-gray-400 text-xs mb-2 flex items-center gap-2">
              <Settings className="w-3 h-3" /> Current Policy</p>
            <select className="w-full bg-gray-600 text-white rounded px-3 py-2 text-sm border-none focus:ring-2 focus:ring-blue-500">
              <option value="balanced">Balanced</option>
              <option value="strict">Strict</option>
              <option value="open">Open (Audit)</option>
            </select>
          </div>
        </div>
      </motion.aside>
    </>
  )
}