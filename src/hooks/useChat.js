import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { sendMessage as sendToAI } from '../services/openrouter'
import { useAuth } from '../context/AuthContext'

export function useChat() {
  const { currentUser } = useAuth()
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Subscribe to chat sessions for the current user
  useEffect(() => {
    if (!currentUser) {
      setSessions([])
      setActiveSessionId(null)
      setMessages([])
      return
    }

    const chatsRef = collection(db, 'users', currentUser.uid, 'chats')
    const q = query(chatsRef, orderBy('updatedAt', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessionList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setSessions(sessionList)
    })

    return unsubscribe
  }, [currentUser])

  // Load messages when active session changes — fetch directly from Firestore
  useEffect(() => {
    if (!activeSessionId || !currentUser) {
      setMessages([])
      return
    }

    let cancelled = false

    const chatRef = doc(db, 'users', currentUser.uid, 'chats', activeSessionId)
    getDoc(chatRef).then((snap) => {
      if (!cancelled && snap.exists()) {
        setMessages(snap.data().messages || [])
      }
    })

    return () => { cancelled = true }
  }, [activeSessionId, currentUser])

  const createNewSession = useCallback(async () => {
    if (!currentUser) return null

    const chatsRef = collection(db, 'users', currentUser.uid, 'chats')
    const newSession = await addDoc(chatsRef, {
      title: 'New Chat',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      messages: [],
    })

    setActiveSessionId(newSession.id)
    setMessages([])
    return newSession.id
  }, [currentUser])

  const selectSession = useCallback((sessionId) => {
    setActiveSessionId(sessionId)
    setMessages([])
    setError(null)
  }, [])

  const deleteSession = useCallback(
    async (sessionId) => {
      if (!currentUser) return

      const chatRef = doc(db, 'users', currentUser.uid, 'chats', sessionId)
      await deleteDoc(chatRef)

      if (activeSessionId === sessionId) {
        setActiveSessionId(null)
        setMessages([])
      }
    },
    [currentUser, activeSessionId]
  )

  const sendMessage = useCallback(
    async (content) => {
      if (!currentUser || !content.trim() || isLoading) return

      setError(null)

      let sessionId = activeSessionId

      if (!sessionId) {
        sessionId = await createNewSession()
        if (!sessionId) return
      }

      const userMessage = {
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      }

      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)
      setIsLoading(true)

      try {
        const chatRef = doc(db, 'users', currentUser.uid, 'chats', sessionId)

        const isFirstMessage = messages.length === 0
        const title = isFirstMessage
          ? content.trim().slice(0, 50) + (content.trim().length > 50 ? '...' : '')
          : undefined

        const aiMessages = updatedMessages.map(({ role, content: c }) => ({
          role,
          content: c,
        }))

        const aiResponse = await sendToAI(aiMessages)

        const assistantMessage = {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date().toISOString(),
        }

        const finalMessages = [...updatedMessages, assistantMessage]
        setMessages(finalMessages)

        const updateData = {
          messages: finalMessages,
          updatedAt: serverTimestamp(),
        }
        if (title) updateData.title = title

        await updateDoc(chatRef, updateData)
      } catch (err) {
        console.error('Error sending message:', err)
        setError(err.message || 'Failed to get AI response. Please try again.')
        setMessages(messages)
      } finally {
        setIsLoading(false)
      }
    },
    [currentUser, activeSessionId, messages, isLoading, createNewSession]
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
