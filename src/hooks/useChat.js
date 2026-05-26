import { useState, useCallback } from 'react'
import { sendMessage as sendToAI } from '../services/openrouter'

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function useChat() {
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const createNewSession = useCallback(() => {
    const id = generateId()
    const newSession = {
      id,
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    }
    setSessions((prev) => [newSession, ...prev])
    setActiveSessionId(id)
    setMessages([])
    setError(null)
    return id
  }, [])

  const selectSession = useCallback((sessionId) => {
    setSessions((prev) => {
      const session = prev.find((s) => s.id === sessionId)
      if (session) setMessages(session.messages || [])
      return prev
    })
    setActiveSessionId(sessionId)
    setError(null)
  }, [])

  const deleteSession = useCallback((sessionId) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    setActiveSessionId((prev) => {
      if (prev === sessionId) {
        setMessages([])
        return null
      }
      return prev
    })
  }, [])

  const sendMessage = useCallback(
    async (content) => {
      if (!content.trim() || isLoading) return

      setError(null)

      let sessionId = activeSessionId
      let isNewSession = false

      if (!sessionId) {
        sessionId = generateId()
        isNewSession = true
        const newSession = {
          id: sessionId,
          title: content.trim().slice(0, 50) + (content.trim().length > 50 ? '...' : ''),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [],
        }
        setSessions((prev) => [newSession, ...prev])
        setActiveSessionId(sessionId)
      }

      const userMessage = {
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      }

      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)
      setIsLoading(true)

      // Update session title on first message
      if (!isNewSession && messages.length === 0) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? { ...s, title: content.trim().slice(0, 50) + (content.trim().length > 50 ? '...' : '') }
              : s
          )
        )
      }

      try {
        const aiMessages = updatedMessages.map(({ role, content: c }) => ({ role, content: c }))
        const aiResponse = await sendToAI(aiMessages)

        const assistantMessage = {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date().toISOString(),
        }

        const finalMessages = [...updatedMessages, assistantMessage]
        setMessages(finalMessages)

        // Save messages into session state
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? { ...s, messages: finalMessages, updatedAt: new Date().toISOString() }
              : s
          )
        )
      } catch (err) {
        console.error('Error sending message:', err)
        setError(err.message || 'Failed to get AI response. Please try again.')
        setMessages(updatedMessages)
      } finally {
        setIsLoading(false)
      }
    },
    [activeSessionId, messages, isLoading]
  )

  return {
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
  }
}
