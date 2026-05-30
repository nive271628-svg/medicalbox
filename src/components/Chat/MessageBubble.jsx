import { useState, useCallback } from 'react'
import { User, Volume2, VolumeX, Copy, Check } from 'lucide-react'

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function renderPlainAnswer(content) {
  if (!content) return null
  return (
    <div className="space-y-2">
      {content.split(/\n\n+/).map((para, i) => (
        <p key={i} className="leading-relaxed whitespace-pre-wrap">{para}</p>
      ))}
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
  const plainText = content || ''

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

    // Split into chunks of max 200 chars at word boundaries
    function splitIntoChunks(text, maxLen = 200) {
      const words = text.split(' ')
      const chunks = []
      let chunk = ''
      for (const word of words) {
        if ((chunk + ' ' + word).trim().length > maxLen) {
          if (chunk) chunks.push(chunk.trim())
          chunk = word
        } else {
          chunk = (chunk + ' ' + word).trim()
        }
      }
      if (chunk) chunks.push(chunk.trim())
      return chunks
    }

    const speak = (voices) => {
      window.speechSynthesis.cancel()
      const locale = detectLang(plainText)
      const langPrefix = locale.split('-')[0]
      const voice =
        voices.find((v) => v.lang === locale) ||
        voices.find((v) => v.lang.startsWith(langPrefix + '-')) ||
        voices.find((v) => v.lang === langPrefix) ||
        voices.find((v) => v.name.toLowerCase().includes(langPrefix)) ||
        null

      const chunks = splitIntoChunks(plainText)

      chunks.forEach((chunk, i) => {
        const utt = new SpeechSynthesisUtterance(chunk)
        utt.lang = locale
        utt.rate = 0.95
        utt.pitch = 1
        utt.volume = 1
        if (voice) utt.voice = voice

        if (i === 0) utt.onstart = () => setIsSpeaking(true)
        if (i === chunks.length - 1) {
          utt.onend = () => setIsSpeaking(false)
          utt.onerror = (e) => { if (e.error !== 'interrupted') setIsSpeaking(false) }
        }
        window.speechSynthesis.speak(utt)
      })

      setIsSpeaking(true)
    }

    // getVoices() is async on most browsers — try immediately, then wait
    const trySpeak = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        speak(voices)
        return
      }
      // Fallback: poll up to 10 times every 100ms (works on mobile Chrome/Safari)
      let attempts = 0
      const interval = setInterval(() => {
        const v = window.speechSynthesis.getVoices()
        if (v.length > 0 || attempts >= 10) {
          clearInterval(interval)
          speak(v)
        }
        attempts++
      }, 100)
    }

    // Trigger voice load (required on some browsers before getVoices() returns anything)
    window.speechSynthesis.getVoices()
    trySpeak()
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
