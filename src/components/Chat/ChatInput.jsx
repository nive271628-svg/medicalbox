import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Mic, MicOff } from 'lucide-react'

export default function ChatInput({ onSend, isLoading, disabled }) {
  const [value, setValue] = useState('')
  const [isListening, setIsListening] = useState(false)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px'
  }, [value])

  function handleSubmit(e) {
    e?.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || isLoading || disabled) return
    onSend(trimmed)
    setValue('')
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

  // Voice input — speech-to-text
  const toggleListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setValue((prev) => (prev ? prev + ' ' + transcript : transcript))
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [isListening])

  const canSend = value.trim().length > 0 && !isLoading && !disabled

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 pt-3 pb-4 pb-[max(1rem,env(safe-area-inset-bottom))] transition-colors duration-200">
      {/* Input row */}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 max-w-3xl mx-auto"
      >
        {/* Mic button — left of textarea */}
        <button
          type="button"
          onClick={toggleListening}
          disabled={isLoading || disabled}
          className={`
            flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center
            transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
            ${isListening
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
            }
            disabled:opacity-40 disabled:cursor-not-allowed
          `}
          aria-label={isListening ? 'Stop listening' : 'Voice input'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Textarea */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? 'Listening...'
                : isLoading
                ? 'DocCareAI is responding...'
                : 'Ask DocCareAI anything...'
            }
            disabled={isLoading || disabled}
            rows={1}
            className="
              w-full resize-none rounded-2xl border border-slate-300 dark:border-slate-600
              bg-slate-50 dark:bg-slate-700
              text-slate-900 dark:text-white
              placeholder-slate-400 dark:placeholder-slate-500
              px-4 py-3
              text-sm leading-relaxed
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-colors
              max-h-[160px] overflow-y-auto
            "
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!canSend}
          className="
            flex-shrink-0 w-11 h-11 rounded-2xl
            flex items-center justify-center
            bg-blue-600 hover:bg-blue-700
            disabled:bg-slate-200 dark:disabled:bg-slate-700
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
        DocCareAI can make mistakes. Always consult a medical professional.
      </p>
    </div>
  )
}
