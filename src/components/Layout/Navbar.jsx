import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, LogOut, ChevronDown, Menu, Globe } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage, LANGUAGES } from '../../context/LanguageContext'
import ThemeToggle from './ThemeToggle'

export default function Navbar({ onMenuToggle }) {
  const { currentUser, logout } = useAuth()
  const { language, changeLanguage } = useLanguage()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  async function handleLogout() {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const userInitial = currentUser?.displayName
    ? currentUser.displayName.charAt(0).toUpperCase()
    : currentUser?.email?.charAt(0).toUpperCase() || 'U'

  const userName = currentUser?.displayName || currentUser?.email || 'User'
  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0]

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors duration-200 z-10 flex-shrink-0">
      {/* Left: menu toggle + logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors md:hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
            DocCareAI
          </span>
        </div>
      </div>

      {/* Right: language + theme + user */}
      <div className="flex items-center gap-2">

        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => { setLangOpen((p) => !p); setDropdownOpen(false) }}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Select language"
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm hidden sm:block">{currentLang.flag} {currentLang.label}</span>
            <span className="text-sm sm:hidden">{currentLang.flag}</span>
          </button>

          {langOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-20 overflow-hidden py-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { changeLanguage(lang.code); setLangOpen(false) }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors
                      ${language === lang.code
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <ThemeToggle />

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => { setDropdownOpen((p) => !p); setLangOpen(false) }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {userInitial}
            </div>
            <span className="text-sm text-slate-700 dark:text-slate-300 max-w-[120px] truncate hidden sm:block">
              {userName}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {currentUser?.displayName || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {currentUser?.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
