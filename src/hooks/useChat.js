import { useState, useCallback, useEffect, useRef } from 'react'
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

  // Always-fresh refs — sendMessage reads these so it never has a stale closure
  // Initialized from current values so they're correct on the very first render
  const activeSessionIdRef = useRef(activeSessionId)
  const messagesRef = useRef(messages)
  const isLoadingRef = useRef(isLoading)
  const userIdRef = useRef(userId)

  // Keep refs in sync on every render (no useEffect delay)
  activeSessionIdRef.current = activeSessionId
  messagesRef.current = messages
  isLoadingRef.current = isLoading
  userIdRef.current = userId

  // Real-time listener for sessions
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
    const uid = userIdRef.current
    if (!uid) return null

    const sessionsRef = collection(db, 'users', uid, 'sessions')
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

  const deleteSession = useCallback(async (sessionId) => {
    const uid = userIdRef.current
    if (!uid) return
    await deleteDoc(doc(db, 'users', uid, 'sessions', sessionId))
    setActiveSessionId((prev) => {
      if (prev === sessionId) {
        setMessages([])
        return null
      }
      return prev
    })
  }, [])

  // sendMessage has NO state in deps — reads everything from refs
  const sendMessage = useCallback(async (content) => {
    const uid = userIdRef.current
    const currentMessages = messagesRef.current
    const currentLoading = isLoadingRef.current
    let sessionId = activeSessionIdRef.current

    if (!content.trim()) return
    if (currentLoading) return
    if (!uid) {
      console.error('[useChat] sendMessage called but uid is null — user not authenticated?')
      setError('Session error — please refresh the page and sign in again.')
      return
    }

    setError(null)
    // Set loading TRUE immediately — before any async work
    // This flips isEmpty in ChatWindow right away so the UI switches from EmptyState to messages view
    setIsLoading(true)
    isLoadingRef.current = true

    // Create a new session if none is active
    if (!sessionId) {
      const sessionsRef = collection(db, 'users', uid, 'sessions')
      const docRef = await addDoc(sessionsRef, {
        title: content.trim().slice(0, 50) + (content.trim().length > 50 ? '...' : ''),
        messages: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      sessionId = docRef.id
      setActiveSessionId(sessionId)
      activeSessionIdRef.current = sessionId
    }

    const userMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...currentMessages, userMessage]
    setMessages(updatedMessages)
    messagesRef.current = updatedMessages

    // Update title only for existing sessions on their first message
    if (currentMessages.length === 0 && activeSessionIdRef.current) {
      await updateDoc(doc(db, 'users', uid, 'sessions', sessionId), {
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
      messagesRef.current = finalMessages

      await updateDoc(doc(db, 'users', uid, 'sessions', sessionId), {
        messages: finalMessages,
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err.message || 'Failed to get AI response. Please try again.')
      setMessages(updatedMessages)
      messagesRef.current = updatedMessages
    } finally {
      setIsLoading(false)
      isLoadingRef.current = false
    }
  }, []) // stable — never recreated

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
