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

  // Refs always hold the latest values — no stale closures in callbacks
  const activeSessionIdRef = useRef(null)
  const messagesRef = useRef([])
  const isLoadingRef = useRef(false)
  const userIdRef = useRef(userId)

  activeSessionIdRef.current = activeSessionId
  messagesRef.current = messages
  isLoadingRef.current = isLoading
  userIdRef.current = userId

  // Real-time listener for sessions list
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

  const sendMessage = useCallback(async (content) => {
    const uid = userIdRef.current
    const currentMessages = messagesRef.current
    const currentLoading = isLoadingRef.current
    let sessionId = activeSessionIdRef.current

    if (!content.trim() || currentLoading) return

    if (!uid) {
      setError('Not signed in. Please refresh and sign in again.')
      return
    }

    // 1. Show user message + typing indicator immediately
    const userMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    }
    const updatedMessages = [...currentMessages, userMessage]
    setMessages(updatedMessages)
    messagesRef.current = updatedMessages
    setIsLoading(true)
    isLoadingRef.current = true
    setError(null)

    try {
      // 2. Create Firestore session if needed (after UI update so user sees message instantly)
      if (!sessionId) {
        const sessionsRef = collection(db, 'users', uid, 'sessions')
        const docRef = await addDoc(sessionsRef, {
          title: content.trim().slice(0, 50) + (content.trim().length > 50 ? '...' : ''),
          messages: updatedMessages,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        sessionId = docRef.id
        setActiveSessionId(sessionId)
        activeSessionIdRef.current = sessionId
      } else if (currentMessages.length === 0) {
        // Existing session, first message — update title
        await updateDoc(doc(db, 'users', uid, 'sessions', sessionId), {
          title: content.trim().slice(0, 50) + (content.trim().length > 50 ? '...' : ''),
          updatedAt: serverTimestamp(),
        })
      }

      // 3. Call AI
      const aiMessages = updatedMessages.map(({ role, content: c }) => ({ role, content: c }))
      const aiResponse = await sendToAI(aiMessages)

      // 4. Show AI response
      const assistantMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      }
      const finalMessages = [...updatedMessages, assistantMessage]
      setMessages(finalMessages)
      messagesRef.current = finalMessages

      // 5. Persist to Firestore
      await updateDoc(doc(db, 'users', uid, 'sessions', sessionId), {
        messages: finalMessages,
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error('[sendMessage] error:', err)
      setError(err.message || 'Failed to get a response. Please try again.')
      // Keep user message visible even on error
      setMessages(updatedMessages)
      messagesRef.current = updatedMessages
    } finally {
      setIsLoading(false)
      isLoadingRef.current = false
    }
  }, [])

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
