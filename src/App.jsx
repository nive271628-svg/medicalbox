import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import Navbar from './components/Layout/Navbar'
import ChatSidebar from './components/Chat/ChatSidebar'
import ChatWindow from './components/Chat/ChatWindow'
import { useChat } from './hooks/useChat'

function ChatPage() {
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
  } = useChat()

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
        <LanguageProvider>
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
