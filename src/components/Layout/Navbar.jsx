import React from 'react'
import { Menu } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Navbar({ onMenuToggle }) {
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors duration-200 z-10 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors md:hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow">
            <img src="/doccare.svg" alt="DocCareAI" className="w-full h-full" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
            DocCareAI
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  )
}
