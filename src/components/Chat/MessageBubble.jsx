import React from 'react'
import { Bot, User } from 'lucide-react'

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
 * Simple markdown-like formatter for message content.
 * Handles: **bold**, *italic*, `code`, ```code blocks```, bullet lists.
 */
function formatContent(content) {
  if (!content) return null

  // Split into lines for processing
  const lines = content.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Code block
    if (line.trim().startsWith('```')) {
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      elements.push(
        <pre key={i} className="bg-black/20 dark:bg-black/30 rounded-lg p-3 overflow-x-auto my-2 text-sm">
          <code>{codeLines.join('\n')}</code>
        </pre>
      )
      i++
      continue
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<br key={i} />)
      i++
      continue
    }

    // Process inline formatting
    elements.push(
      <p key={i} className="mb-1 last:mb-0">
        {parseInline(line)}
      </p>
    )
    i++
  }

  return elements
}

function parseInline(text) {
  const parts = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
    // Italic: *text*
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/)
    // Inline code: `text`
    const codeMatch = remaining.match(/`(.+?)`/)

    const matches = [
      boldMatch && { match: boldMatch, type: 'bold' },
      italicMatch && { match: italicMatch, type: 'italic' },
      codeMatch && { match: codeMatch, type: 'code' },
    ].filter(Boolean)

    if (matches.length === 0) {
      parts.push(<span key={key++}>{remaining}</span>)
      break
    }

    // Find earliest match
    const earliest = matches.reduce((a, b) =>
      a.match.index <= b.match.index ? a : b
    )

    const { match, type } = earliest

    // Text before match
    if (match.index > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, match.index)}</span>)
    }

    // The matched element
    if (type === 'bold') {
      parts.push(<strong key={key++} className="font-semibold">{match[1]}</strong>)
    } else if (type === 'italic') {
      parts.push(<em key={key++}>{match[1]}</em>)
    } else if (type === 'code') {
      parts.push(
        <code key={key++} className="bg-black/20 dark:bg-black/30 px-1 py-0.5 rounded text-sm font-mono">
          {match[1]}
        </code>
      )
    }

    remaining = remaining.slice(match.index + match[0].length)
  }

  return parts
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
      {/* Avatar */}
      <div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
          ${isUser
            ? 'bg-blue-600 text-white'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }
        `}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`
            px-4 py-3 rounded-2xl text-sm leading-relaxed
            ${isUser
              ? 'bg-blue-600 text-white rounded-tr-sm'
              : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-sm shadow-sm border border-slate-200 dark:border-slate-600'
            }
          `}
        >
          <div className="message-content">
            {formatContent(message.content)}
          </div>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
}
