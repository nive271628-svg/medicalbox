import { useState } from 'react'
import { sendMessage as sendToAI } from '../services/openrouter'

export function useChat() {
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const createNewSession = () => {
    setMessages([])
    setActiveSessionId(Date.now().toString())
  }

  const selectSession = () => {}

  const deleteSession = () => {
    setMessages([])
  }

  const sendMessage = async (content) => {
    if (!content.trim()) return

    const userMessage = {
      role: 'user',
      content,
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsLoading(true)

    try {
      const reply = await sendToAI(updatedMessages)

      const assistantMessage = {
        role: 'assistant',
        content: reply,
      }

      setMessages([...updatedMessages, assistantMessage])
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

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