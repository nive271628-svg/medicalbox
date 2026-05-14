import React, { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

export default function ChatInput({ onSend, isLoading, disabled }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
  }, [value])

  function handleSubmit(e) {
    e?.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || isLoading || disabled) return
    onSend(trimmed)
    setValue('')
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const canSend = value.trim().length > 0 && !isLoading && !disabled

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 transition-colors duration-200">
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-3 max-w-3xl mx-auto"
      >
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? 'AI is responding...' : 'Message AI Assistant... (Enter to send, Shift+Enter for new line)'}
            disabled={isLoading || disabled}
            rows={1}
            className="
              w-full resize-none rounded-xl border border-slate-300 dark:border-slate-600
              bg-slate-50 dark:bg-slate-700
              text-slate-900 dark:text-white
              placeholder-slate-400 dark:placeholder-slate-500
              px-4 py-3 pr-12
              text-sm leading-relaxed
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-colors
              max-h-[200px] overflow-y-auto
            "
          />
        </div>

        <button
          type="submit"
          disabled={!canSend}
          className="
            flex-shrink-0 w-10 h-10 rounded-xl
            flex items-center justify-center
            bg-blue-600 hover:bg-blue-700
            disabled:bg-slate-300 dark:disabled:bg-slate-600
            text-white disabled:text-slate-400 dark:disabled:text-slate-500
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          "
          aria-label="Send message"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

      <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2">
        AI can make mistakes. Consider checking important information.
      </p>
    </div>
  )
}
