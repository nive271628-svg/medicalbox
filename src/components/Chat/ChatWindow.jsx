import React, { useEffect, useRef } from 'react'
import { Bot, Sparkles } from 'lucide-react'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'

function TypingIndicator() {
  return (
    <div className="flex gap-2 sm:gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
        <Bot className="w-4 h-4 text-slate-600 dark:text-slate-300" />
      </div>
      <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onNewChat }) {
  const suggestions = [
    'What are symptoms of high blood pressure?',
    'How do I manage diabetes with diet?',
    'Explain common cold vs flu differences',
    'What vitamins should I take daily?',
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-10 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-4 shadow-lg">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
        How can DocCareAI help you?
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm text-sm sm:text-base">
        Ask any health or medical question and get a direct, clear answer.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onNewChat(suggestion)}
            className="
              text-left px-4 py-3 rounded-xl
              border border-slate-200 dark:border-slate-700
              bg-white dark:bg-slate-800
              text-slate-700 dark:text-slate-300
              text-sm
              hover:border-blue-400 dark:hover:border-blue-500
              hover:bg-blue-50 dark:hover:bg-blue-900/20
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ChatWindow({ messages, isLoading, error, onSend, onClearError }) {
  const bottomRef = useRef(null)
  const containerRef = useRef(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const isEmpty = messages.length === 0 && !error

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Messages area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto"
      >
        {isEmpty && !isLoading ? (
          <EmptyState onNewChat={onSend} />
        ) : (
          <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}

            {isLoading && <TypingIndicator />}

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl rounded-tl-sm px-4 py-3">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                  <button
                    onClick={onClearError}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mt-1 ml-1 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSend={onSend}
        isLoading={isLoading}
        disabled={false}
      />
    </div>
  )
}
