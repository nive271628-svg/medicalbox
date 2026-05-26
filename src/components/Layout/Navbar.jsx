import React, { useState } from 'react'
import { Menu, LogOut, User } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Navbar({ onMenuToggle }) {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    try {
      setLoggingOut(true)
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      setLoggingOut(false)
    }
  }

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'
  const initials = displayName.slice(0, 2).toUpperCase()

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

        {currentUser && (
          <>
            {/* User avatar / name */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={displayName}
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">{initials}</span>
                </div>
              )}
              <span className="text-sm text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                {displayName}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Sign out"
              title="Sign out"
            >
              {loggingOut
                ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <LogOut className="w-4 h-4" />
              }
              <span className="hidden sm:inline">{loggingOut ? 'Signing out...' : 'Sign out'}</span>
            </button>
          </>
        )}
      </div>
    </header>
  )
}
