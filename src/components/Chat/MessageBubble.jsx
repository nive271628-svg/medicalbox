import React, { useState, useCallback } from 'react'
import { User, Volume2, VolumeX, Copy, Check } from 'lucide-react'

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function stripMarkdown(content) {
  if (!content) return ''
  return content
    .replace(/```[\s\S]*?```/g, (match) =>
      match.replace(/```\w*\n?/g, '').replace(/```/g, '')
    )
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/^[\*\-\+]\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function renderPlainAnswer(content) {
  const cleaned = stripMarkdown(content)
  if (!cleaned) return null

  const paragraphs = cleaned.split(/\n\n+/)
  return (
    <div className="space-y-2">
      {paragraphs.map((para, i) => {
        const lines = para.split('\n')
        const isList = lines.every((l) => l.startsWith('• '))
        if (isList) {
          return (
            <ul key={i} className="space-y-1 pl-1">
              {lines.map((line, j) => (
                <li key={j} className="flex gap-2 leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 flex-shrink-0" />
                  <span>{line.replace(/^• /, '')}</span>
                </li>
              ))}
            </ul>
          )
        }
        return (
          <p key={i} className="leading-relaxed">
            {lines.map((line, j) => (
              <React.Fragment key={j}>
                {line.startsWith('• ')
                  ? <span className="flex gap-2 mt-1"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 flex-shrink-0" /><span>{line.replace(/^• /, '')}</span></span>
                  : line
                }
                {j < lines.length - 1 && !line.startsWith('• ') && <br />}
              </React.Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}

function detectLang(text) {
  if (!text) return 'en-US'
  // Tamil
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN'
  // Hindi / Devanagari
  if (/[\u0900-\u097F]/.test(text)) return 'hi-IN'
  // Telugu
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te-IN'
  // Kannada
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn-IN'
  // Malayalam
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml-IN'
  // Bengali
  if (/[\u0980-\u09FF]/.test(text)) return 'bn-IN'
  // Arabic / Urdu
  if (/[\u0600-\u06FF]/.test(text)) return 'ar-SA'
  // Chinese
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh-CN'
  // Japanese
  if (/[\u3040-\u30FF]/.test(text)) return 'ja-JP'
  // Korean
  if (/[\uAC00-\uD7AF]/.test(text)) return 'ko-KR'
  // Russian / Cyrillic
  if (/[\u0400-\u04FF]/.test(text)) return 'ru-RU'
  // Greek
  if (/[\u0370-\u03FF]/.test(text)) return 'el-GR'
  // Thai
  if (/[\u0E00-\u0E7F]/.test(text)) return 'th-TH'
  return 'en-US'
}

function MessageActions({ content }) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [copied, setCopied] = useState(false)
  const plainText = stripMarkdown(content)

  const toggleSpeaking = useCallback(() => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    if (!window.speechSynthesis) {
      alert('Text-to-speech is not supported in your browser.')
      return
    }

    const doSpeak = (voices) => {
      window.speechSynthesis.cancel()

      const locale = detectLang(plainText)
      const utterance = new SpeechSynthesisUtterance(plainText)
      utterance.lang = locale
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1

      // Build a priority list of voice candidates for the detected locale
      const langPrefix = locale.split('-')[0] // e.g. 'hi' from 'hi-IN'

      const voice =
        // 1. Exact locale match (e.g. hi-IN)
        voices.find((v) => v.lang === locale) ||
        // 2. Same language, any region (e.g. hi-IN, hi-IN-x-*)
        voices.find((v) => v.lang.startsWith(langPrefix + '-')) ||
        // 3. Bare language code
        voices.find((v) => v.lang === langPrefix) ||
        // 4. Google/Microsoft named voices for the language (common in Chrome)
        voices.find((v) => v.name.toLowerCase().includes(langPrefix)) ||
        null

      // Only assign a voice if we found one — otherwise let the browser
      // use its built-in engine for the lang tag (better than forcing English)
      if (voice) utterance.voice = voice

      utterance.onstart = () => setIsSpeaking(true)

      // Chrome bug fix: keep speech alive with a periodic resume
      const resumeTimer = setInterval(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause()
          window.speechSynthesis.resume()
        } else {
          clearInterval(resumeTimer)
        }
      }, 10000)

      utterance.onend = () => {
        clearInterval(resumeTimer)
        setIsSpeaking(false)
      }
      utterance.onerror = (e) => {
        // 'not-allowed' or 'language-unavailable' — try again without a specific voice
        if (e.error === 'language-unavailable' || e.error === 'voice-unavailable') {
          window.speechSynthesis.cancel()
          const fallback = new SpeechSynthesisUtterance(plainText)
          fallback.lang = locale
          fallback.rate = 0.9
          fallback.onend = () => setIsSpeaking(false)
          fallback.onerror = () => setIsSpeaking(false)
          window.speechSynthesis.speak(fallback)
        } else {
          clearInterval(resumeTimer)
          setIsSpeaking(false)
        }
      }

      setIsSpeaking(true)
      window.speechSynthesis.speak(utterance)
    }

    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      doSpeak(voices)
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null
        doSpeak(window.speechSynthesis.getVoices())
      }
      // Trigger voice load
      window.speechSynthesis.getVoices()
    }
  }, [isSpeaking, plainText])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(plainText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [plainText])

  return (
    <div className="flex items-center gap-1.5 mt-1.5 px-1">
      <button
        type="button"
        onClick={toggleSpeaking}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
          ${isSpeaking
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 animate-pulse'
            : 'bg-slate-100 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        aria-label={isSpeaking ? 'Stop' : 'Listen'}
      >
        {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
        <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
      </button>

      <button
        type="button"
        onClick={handleCopy}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
          ${copied
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : 'bg-slate-100 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        aria-label="Copy"
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
  )
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-2 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 mt-1 overflow-hidden
        ${isUser ? 'bg-blue-600 flex items-center justify-center' : 'shadow'}`}>
        {isUser
          ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          : <img src="/doccare.svg" alt="DocCareAI" className="w-full h-full" />
        }
      </div>

      <div className={`flex flex-col max-w-[82%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {!isUser && (
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1 px-1">
            DocCareAI
          </span>
        )}
        <div className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-sm shadow-sm border border-slate-200 dark:border-slate-600'
          }`}>
          {renderPlainAnswer(message.content)}
        </div>

        {!isUser && <MessageActions content={message.content} />}

        <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
}
