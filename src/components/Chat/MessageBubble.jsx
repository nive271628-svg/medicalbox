import React, { useState, useCallback } from 'react'
import { Bot, User, Volume2, VolumeX, Copy, Check } from 'lucide-react'

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/** Strip markdown and return clean plain text string */
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

/** Render human-friendly paragraphs and bullet lines from cleaned content */
function renderPlainAnswer(content) {
  const cleaned = stripMarkdown(content)
  if (!cleaned) return null

  const paragraphs = cleaned.split(/\n\n+/)

  return (
    <div className="space-y-2">
      {paragraphs.map((para, i) => {
        const lines = para.split('\n')

        // If all lines in this block are bullet points, render as a soft list
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

        // Mixed or plain paragraph
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

/**
 * Pick the best "doctor-like" voice from available SpeechSynthesis voices.
 * Priority: deep/calm male English voice → any English male → any English → fallback default.
 */
function pickDoctorVoice(voices) {
  // Preferred voice names (calm, authoritative male voices available on most platforms)
  const preferred = [
    'Google UK English Male',
    'Microsoft George',          // Windows
    'Microsoft David',           // Windows
    'Microsoft Mark',            // Windows
    'Daniel',                    // macOS / iOS
    'Fred',                      // macOS
    'Alex',                      // macOS
    'Google US English',
  ]

  for (const name of preferred) {
    const match = voices.find((v) => v.name === name)
    if (match) return match
  }

  // Fallback: any English male voice
  const engMale = voices.find(
    (v) => v.lang.startsWith('en') && /male/i.test(v.name)
  )
  if (engMale) return engMale

  // Fallback: any English voice
  const eng = voices.find((v) => v.lang.startsWith('en'))
  if (eng) return eng

  return null // browser default
}

/** Voice + Copy action bar shown below AI bubbles */
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

    const speak = () => {
      const voices = window.speechSynthesis.getVoices()
      const utterance = new SpeechSynthesisUtterance(plainText)
      utterance.lang = 'en-US'
      utterance.rate = 0.92   // slightly slower — calm, measured delivery
      utterance.pitch = 0.85  // slightly lower pitch — authoritative, doctor-like
      utterance.volume = 1

      const doctorVoice = pickDoctorVoice(voices)
      if (doctorVoice) utterance.voice = doctorVoice

      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
      setIsSpeaking(true)
    }

    // Voices may not be loaded yet on first call
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      speak()
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null
        speak()
      }
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
      {/* Read aloud */}
      <button
        type="button"
        onClick={toggleSpeaking}
        className={`
          flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
          transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
          ${isSpeaking
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 animate-pulse'
            : 'bg-slate-100 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
          }
        `}
        aria-label={isSpeaking ? 'Stop reading' : 'Read aloud'}
      >
        {isSpeaking
          ? <VolumeX className="w-3 h-3" />
          : <Volume2 className="w-3 h-3" />
        }
        <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
      </button>

      {/* Copy */}
      <button
        type="button"
        onClick={handleCopy}
        className={`
          flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
          transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
          ${copied
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : 'bg-slate-100 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
          }
        `}
        aria-label="Copy response"
      >
        {copied
          ? <Check className="w-3 h-3" />
          : <Copy className="w-3 h-3" />
        }
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
  )
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-2 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
      {/* Avatar */}
      <div
        className={`
          w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
          ${isUser
            ? 'bg-blue-600 text-white'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }
        `}
      >
        {isUser
          ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          : <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        }
      </div>

      {/* Bubble + actions */}
      <div className={`flex flex-col max-w-[82%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Message bubble */}
        <div
          className={`
            px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-sm leading-relaxed
            ${isUser
              ? 'bg-blue-600 text-white rounded-tr-sm'
              : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-sm shadow-sm border border-slate-200 dark:border-slate-600'
            }
          `}
        >
          {renderPlainAnswer(message.content)}
        </div>

        {/* Action buttons — only for AI messages */}
        {!isUser && <MessageActions content={message.content} />}

        {/* Timestamp */}
        <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
}
