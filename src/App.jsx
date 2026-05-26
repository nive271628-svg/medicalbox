import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Layout/Navbar'
import ChatSidebar from './components/Chat/ChatSidebar'
import ChatWindow from './components/Chat/ChatWindow'
import Login from './components/Auth/Login'
import Signup from './components/Auth/Signup'
import { useChat } from './hooks/useChat'

// Redirect to /login if not authenticated
function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth()
  if (loading) return null
  return currentUser ? children : <Navigate to="/login" replace />
}

// Redirect to /chat if already logged in
function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth()
  if (loading) return null
  return !currentUser ? children : <Navigate to="/chat" replace />
}

function ChatPage() {
  const { currentUser } = useAuth()
  const uid = currentUser?.uid ?? null

  const {
    sessions,
    activeSessionId,
    messages,
    isLoading,
    error,
    createNewSession,
    selectSession,
    deleteSession,
    sendMessage,
    setError,
  } = useChat(uid)

  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleNewChat() {
    createNewSession()
    setSidebarOpen(false)
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-white dark:bg-slate-900 transition-colors duration-200">
      <Navbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={selectSession}
          onNewChat={handleNewChat}
          onDeleteSession={deleteSession}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex flex-1 min-w-0 overflow-hidden">
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            error={error}
            onSend={sendMessage}
            onClearError={() => setError(null)}
          />
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
            <Routes>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
              <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
              <Route path="/" element={<Navigate to="/chat" replace />} />
              <Route path="*" element={<Navigate to="/chat" replace />} />
            </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
