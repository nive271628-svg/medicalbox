import { useState, useCallback, useEffect } from 'react'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { sendMessage as sendToAI } from '../services/openrouter'

export function useChat(userId) {
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Real-time listener for sessions from Firestore
  useEffect(() => {
    if (!userId) {
      setSessions([])
      setActiveSessionId(null)
      setMessages([])
      return
    }

    const sessionsRef = collection(db, 'users', userId, 'sessions')
    const q = query(sessionsRef, orderBy('updatedAt', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      setSessions(loaded)
    })

    return unsubscribe
  }, [userId])

  const createNewSession = useCallback(async () => {
    if (!userId) return null

    const sessionsRef = collection(db, 'users', userId, 'sessions')
    const docRef = await addDoc(sessionsRef, {
      title: 'New Chat',
      messages: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    setActiveSessionId(docRef.id)
    setMessages([])
    setError(null)
    return docRef.id
  }, [userId])

  const selectSession = useCallback((sessionId) => {
    setSessions((prev) => {
      const session = prev.find((s) => s.id === sessionId)
      if (session) setMessages(session.messages || [])
      return prev
    })
    setActiveSessionId(sessionId)
    setError(null)
  }, [])

  const deleteSession = useCallback(async (sessionId) => {
    if (!userId) return
    await deleteDoc(doc(db, 'users', userId, 'sessions', sessionId))
    setActiveSessionId((prev) => {
      if (prev === sessionId) {
        setMessages([])
        return null
      }
      return prev
    })
  }, [userId])

  const sendMessage = useCallback(
    async (content) => {
      if (!content.trim() || isLoading || !userId) return

      setError(null)

      let sessionId = activeSessionId

      // Create a new session in Firestore if none is active
      if (!sessionId) {
        const sessionsRef = collection(db, 'users', userId, 'sessions')
        const docRef = await addDoc(sessionsRef, {
          title: content.trim().slice(0, 50) + (content.trim().length > 50 ? '...' : ''),
          messages: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        sessionId = docRef.id
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

      // Update title only for existing sessions on their first message
      // (new sessions already have the title set during addDoc above)
      if (messages.length === 0 && activeSessionId) {
        await updateDoc(doc(db, 'users', userId, 'sessions', sessionId), {
          title: content.trim().slice(0, 50) + (content.trim().length > 50 ? '...' : ''),
          updatedAt: serverTimestamp(),
        })
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

        // Persist messages to Firestore
        await updateDoc(doc(db, 'users', userId, 'sessions', sessionId), {
          messages: finalMessages,
          updatedAt: serverTimestamp(),
        })
      } catch (err) {
        console.error('Error sending message:', err)
        setError(err.message || 'Failed to get AI response. Please try again.')
        setMessages(updatedMessages)
      } finally {
        setIsLoading(false)
      }
    },
    [userId, activeSessionId, messages, isLoading]
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
