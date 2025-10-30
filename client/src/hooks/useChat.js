import { useState, useEffect, useRef } from 'react'
import { chatAPI } from '../services/api'

export const useChat = (isAuthenticated) => {
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatCount, setChatCount] = useState({ todayCount: 0, maxChats: 5, isPremium: false })
  const [isSendingToNewChat, setIsSendingToNewChat] = useState(false)
  const [researchPresence, setResearchPresence] = useState({ hasOpenAI: false, hasGemini: false })
  const pollingIntervalRef = useRef(null)
  
  // Research flow state
  const [researchState, setResearchState] = useState({
    isResearchMode: false,
    originalTopic: '',
    clarifyingQuestions: [],
    currentQuestionIndex: 0,
    answers: [],
    isWaitingForAnswer: false,
    isCompleted: false,
    hasError: false,
    awaitingReport: false
  })

  // Load user's chats when authenticated, clear when not
  useEffect(() => {
    if (isAuthenticated) {
      loadChats()
      loadChatCount()
    } else {
      clearChatData()
    }
  }, [isAuthenticated])

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat && !isSendingToNewChat) {
      loadMessages(activeChat)
    }
  }, [activeChat, isSendingToNewChat])

  // Track arrival of ChatGPT and Gemini research messages
  useEffect(() => {
    const hasOpenAI = messages.some(m => !m.isUser && (m.text || '').startsWith('## ChatGPT (OpenAI) Research'))
    const hasGemini = messages.some(m => !m.isUser && (m.text || '').startsWith('## Gemini (Google) Research'))
    setResearchPresence(prev => {
      const next = { hasOpenAI, hasGemini }
      return (prev.hasOpenAI !== next.hasOpenAI || prev.hasGemini !== next.hasGemini) ? next : prev
    })
  }, [messages])

  // NEW: Continuous polling effect for research in progress
  useEffect(() => {
    // Clear any existing polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }

    // Start polling if:
    // 1. We have an active chat
    // 2. Research is in progress (not completed and no error)
    // 3. We don't have both reports yet
    const shouldPoll = activeChat && 
                      !researchState.isCompleted && 
                      !researchState.hasError &&
                      (!researchPresence.hasOpenAI || !researchPresence.hasGemini)

    if (shouldPoll) {
      console.log('=== useChat: Starting polling for research updates ===', {
        hasOpenAI: researchPresence.hasOpenAI,
        hasGemini: researchPresence.hasGemini
      })

      // Poll every 2 seconds
      pollingIntervalRef.current = setInterval(() => {
        console.log('=== useChat: Polling for updates ===')
        loadMessages(activeChat)
      }, 2000)
    }

    // Cleanup function
    return () => {
      if (pollingIntervalRef.current) {
        console.log('=== useChat: Stopping polling ===')
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [activeChat, researchState.isCompleted, researchState.hasError, researchPresence.hasOpenAI, researchPresence.hasGemini])

  const loadChats = async () => {
    try {
      const data = await chatAPI.getChats()
      if (data.success) {
        setChats(data.chats)
        // Set first chat as active if no active chat
        if (!activeChat && data.chats.length > 0) {
          setActiveChat(data.chats[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to load chats:', error)
      // Re-throw authentication errors to be handled by parent
      if (error.message === 'Authentication required') {
        throw error
      }
    }
  }

  const loadMessages = async (chatId) => {
    try {
      const data = await chatAPI.getChatMessages(chatId)
      if (data.success) {
        let transformedMessages = data.messages.map(msg => ({
          id: msg.id,
          text: msg.content,
          isUser: msg.is_user
        }))
        
        // Check what research reports we have
        const hasOpenAI = transformedMessages.some(m => !m.isUser && (m.text || '').startsWith('## ChatGPT (OpenAI) Research'))
        const hasGemini = transformedMessages.some(m => !m.isUser && (m.text || '').startsWith('## Gemini (Google) Research'))
        
        // If OpenAI research exists but Gemini hasn't arrived yet, show a local placeholder
        if (hasOpenAI && !hasGemini) {
          const placeholderExists = transformedMessages.some(m => 
            typeof m.id === 'string' && m.id.startsWith('gemini-placeholder-')
          )
          
          if (!placeholderExists) {
            transformedMessages = [
              ...transformedMessages,
              {
                id: `gemini-placeholder-${Date.now()}`,
                text: '## Gemini (Google) Research\n\nGenerating summary and insights...'
                  + '\n\n(Please keep this tab open; the Gemini section will appear shortly.)',
                isUser: false
              }
            ]
          }
        }

        setMessages(transformedMessages)
        
        // Get chat info to check completion status from database
        const chatData = await chatAPI.getChatInfo(chatId)
        if (chatData.success) {
          const chat = chatData.chat
          console.log('=== useChat: Loaded chat status from database ===', { 
            isCompleted: chat.is_completed, 
            hasError: chat.has_error 
          })
          
          setResearchState(prev => ({
            ...prev,
            isCompleted: chat.is_completed || false,
            hasError: chat.has_error || false,
            awaitingReport: prev.awaitingReport && !(chat.is_completed || chat.has_error)
          }))
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
      // Re-throw authentication errors to be handled by parent
      if (error.message === 'Authentication required') {
        throw error
      }
    }
  }

  const loadChatCount = async () => {
    try {
      const data = await chatAPI.getChatCount()
      if (data.success) {
        setChatCount({
          todayCount: data.todayCount,
          maxChats: data.maxChats,
          isPremium: data.isPremium
        })
      }
    } catch (error) {
      console.error('Failed to load chat count:', error)
      // Re-throw authentication errors to be handled by parent
      if (error.message === 'Authentication required') {
        throw error
      }
    }
  }

  const clearChatData = () => {
    // Clear polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    
    setChats([])
    setActiveChat(null)
    setMessages([])
    setNewMessage('')
    setChatCount({ todayCount: 0, maxChats: 5, isPremium: false })
    setIsSendingToNewChat(false)
    setResearchState({
      isResearchMode: false,
      originalTopic: '',
      clarifyingQuestions: [],
      currentQuestionIndex: 0,
      answers: [],
      isWaitingForAnswer: false,
      isCompleted: false,
      hasError: false,
      awaitingReport: false
    })
  }

  // Clear active chat without creating a new one
  const clearActiveChat = () => {
    // Clear polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    
    setActiveChat(null)
    setMessages([])
    setNewMessage('')
    setIsSendingToNewChat(false)
    setResearchState({
      isResearchMode: false,
      originalTopic: '',
      clarifyingQuestions: [],
      currentQuestionIndex: 0,
      answers: [],
      isWaitingForAnswer: false,
      isCompleted: false,
      hasError: false,
      awaitingReport: false
    })
  }

  const loadChatsOnDemand = async () => {
    try {
      await loadChats()
      await loadChatCount()
    } catch (error) {
      console.error('Failed to load chats on demand:', error)
      // Re-throw authentication errors to be handled by parent
      if (error.message === 'Authentication required') {
        throw error
      }
    }
  }

  const handleNewChat = () => {
    // Just clear the UI - don't create a chat in the database
    clearActiveChat()
  }

  const handleChatSelect = (chatId) => {
    setActiveChat(chatId)
  }

  const handleSendMessage = async () => {
    if (newMessage.trim() && activeChat && !researchState.isCompleted && !researchState.hasError) {
      console.log('=== useChat: Starting message send ===', { 
        activeChat, 
        newMessage, 
        researchState 
      })
      
      const userMessage = {
        id: Date.now(),
        text: newMessage,
        isUser: true
      }
      setMessages([...messages, userMessage])
      const currentMessage = newMessage
      setNewMessage('')
      
      try {
        setLoading(true)
        
        // Determine which API endpoint to call based on research state
        if (!researchState.isResearchMode) {
          console.log('=== useChat: First message - treating as research topic ===')
          // First message - treat as research topic
          setResearchState(prev => ({
            ...prev,
            isResearchMode: true,
            originalTopic: currentMessage
          }))
          
          const data = await chatAPI.sendResearchTopic(activeChat, currentMessage)
          
          if (data.success) {
            // If server returned both research pages, replace any Gemini placeholder and append OpenAI then Gemini
            if (data.messageType === 'research_pages') {
              setMessages(prev => {
                const filtered = prev.filter(m => {
                  const t = (m.text || '')
                  const isPlaceholder = typeof m.id === 'string' && m.id.startsWith('gemini-placeholder-')
                  const isPlaceholderText = t.includes('Gemini (Google) Research') && t.includes('Generating summary and insights')
                  return !(isPlaceholder || isPlaceholderText)
                })
                const newMessages = []
                if (data.openaiResearch) {
                  newMessages.push({ id: Date.now() + 1, text: data.openaiResearch, isUser: false })
                }
                if (data.geminiResearch) {
                  newMessages.push({ id: Date.now() + 2, text: data.geminiResearch, isUser: false })
                }
                return [...filtered, ...newMessages]
              })
            } else {
              const aiMessage = {
                id: Date.now() + 1,
                text: data.response,
                isUser: false
              }
              setMessages(prev => [...prev, aiMessage])
            }
            
            // Handle clarifying questions response
            if (data.messageType === 'clarifying_questions' && data.questions) {
              console.log('=== useChat: Received clarifying questions ===', data.questions)
              setResearchState(prev => ({
                ...prev,
                clarifyingQuestions: data.questions,
                isWaitingForAnswer: true,
                currentQuestionIndex: 0
              }))
              // Only show the first question as an assistant message
              setMessages(prev => [
                ...prev,
                {
                  id: Date.now() + 3,
                  text: `Assistant: ${data.questions[0]}`,
                  isUser: false,
                },
              ])
              // DO NOT show the generic data.response or assistant summary (which includes all questions)
            } else if (data.response) {
              // Only add the response if it's not part of clarifying_questions
              const aiMessage = {
                id: Date.now() + 1,
                text: data.response,
                isUser: false
              }
              setMessages(prev => [...prev, aiMessage])
            }
            
            // Handle title update
            if (data.title) {
              console.log('=== useChat: Updating chat title ===', data.title)
              await loadChats()
            }
          }
        } else if (researchState.isWaitingForAnswer) {
          console.log('=== useChat: Answering clarifying question ===', {
            currentQuestionIndex: researchState.currentQuestionIndex,
            totalQuestions: researchState.clarifyingQuestions.length
          })
          
          // Answering clarifying questions
          const newAnswers = [...researchState.answers, currentMessage]
          const nextQuestionIndex = researchState.currentQuestionIndex + 1
          
          const data = await chatAPI.sendClarificationAnswer(
            activeChat, 
            currentMessage, 
            researchState.currentQuestionIndex,
            researchState.clarifyingQuestions.length,
            researchState.originalTopic,
            researchState.clarifyingQuestions,
            newAnswers
          )
          
          if (data.success) {
            if (data.response) {
              const aiMessage = {
                id: Date.now() + 1,
                text: data.response,
                isUser: false
              }
              setMessages(prev => [...prev, aiMessage])
            }
            // Update research state
            if (data.messageType === 'research_pages') {
              console.log('=== useChat: Research page generated, will poll for updates ===')
              // All questions answered, research started - polling will handle updates
              setResearchState(prev => ({
                ...prev,
                answers: newAnswers,
                isWaitingForAnswer: false,
                awaitingReport: true
              }))
            } else {
              // More questions to answer
              setResearchState(prev => {
                const updatedState = {
                  ...prev,
                  answers: newAnswers,
                  currentQuestionIndex: nextQuestionIndex,
                  isWaitingForAnswer: nextQuestionIndex < prev.clarifyingQuestions.length
                };
                // If there is another clarifying question, add it as an assistant message
                if (nextQuestionIndex < prev.clarifyingQuestions.length) {
                  setMessages(messagesSoFar => [
                    ...messagesSoFar,
                    {
                      id: Date.now() + 4,
                      text: `Assistant: ${prev.clarifyingQuestions[nextQuestionIndex]}`,
                      isUser: false,
                    },
                  ])
                }
                return updatedState;
              })
            }
          }
        }
      } catch (error) {
        console.error('=== useChat: Chat error ===', error)
        
        // Re-throw authentication errors to be handled by parent
        if (error.message === 'Authentication required') {
          throw error
        }
        
        const errorMessage = {
          id: Date.now() + 1,
          text: "I'm not able to find the answer right now. Please try again.",
          isUser: false
        }
        setMessages(prev => [...prev, errorMessage])
        
        // Mark chat as having an error to prevent further messages
        setResearchState(prev => ({
          ...prev,
          hasError: true,
          isCompleted: false
        }))
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSendMessageToNewChat = async () => {
    if (newMessage.trim() && !researchState.isCompleted && !researchState.hasError) {
      console.log('=== useChat: Creating new chat and sending message ===', { newMessage })
      
      try {
        setLoading(true)
        setIsSendingToNewChat(true)
        // Create new chat first
        const chatData = await chatAPI.createChat()
        
        if (chatData.success) {
          console.log('=== useChat: New chat created ===', chatData.chat.id)
          
          // Set the new chat as active
          setActiveChat(chatData.chat.id)
          setMessages([])
          
          // Reset research state for new chat
          setResearchState({
            isResearchMode: false,
            originalTopic: '',
            clarifyingQuestions: [],
            currentQuestionIndex: 0,
            answers: [],
            isWaitingForAnswer: false,
            isCompleted: false,
            hasError: false
          })
          
          // Reload chats to get the new chat in the list
          await loadChats()
          await loadChatCount()
          
          // Now send the message to the new chat
          const userMessage = {
            id: Date.now(),
            text: newMessage,
            isUser: true
          }
          setMessages([userMessage])
          const currentMessage = newMessage
          setNewMessage('')
          
          // Start research mode for new chat
          setResearchState(prev => ({
            ...prev,
            isResearchMode: true,
            originalTopic: currentMessage
          }))
          
          console.log('=== useChat: Sending research topic to new chat ===')
          const data = await chatAPI.sendResearchTopic(chatData.chat.id, currentMessage)
          
          if (data.success) {
            const aiMessage = {
              id: Date.now() + 1,
              text: data.response,
              isUser: false
            }
            setMessages(prev => [...prev, aiMessage])
            
            // Handle clarifying questions response
            if (data.messageType === 'clarifying_questions' && data.questions) {
              console.log('=== useChat: Received clarifying questions for new chat ===', data.questions)
              setResearchState(prev => ({
                ...prev,
                clarifyingQuestions: data.questions,
                isWaitingForAnswer: true,
                currentQuestionIndex: 0
              }))
            }
            
            // Handle title update
            if (data.title) {
              console.log('=== useChat: Updating new chat title ===', data.title)
              await loadChats()
            }
          }
        }
      } catch (error) {
        console.error('=== useChat: Failed to create chat and send message ===', error)
        
        // Re-throw authentication errors to be handled by parent
        if (error.message === 'Authentication required') {
          throw error
        }
        
        const errorMessage = {
          id: Date.now() + 1,
          text: "I'm not able to find the answer right now. Please try again.",
          isUser: false
        }
        setMessages(prev => [...prev, errorMessage])
        
        // Mark chat as having an error to prevent further messages
        setResearchState(prev => ({
          ...prev,
          hasError: true,
          isCompleted: false
        }))
      } finally {
        setLoading(false)
        setIsSendingToNewChat(false)
      }
    }
  }

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value)
  }

  const handleSendEmail = async () => {
    if (!activeChat) {
      console.error('No active chat to send email for')
      return
    }

    try {
      console.log('=== useChat: Sending research report via email ===', { activeChat })
      const result = await chatAPI.sendResearchReport(activeChat)
      
      if (result.success) {
        console.log('=== useChat: Email sent successfully ===', result)
        // You could show a success message to the user here
        return result
      }
    } catch (error) {
      console.error('=== useChat: Failed to send email ===', error)
      throw error
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      // Check if chat is completed or has error
      if (researchState.isCompleted || researchState.hasError) {
        return // Don't allow sending messages if chat is completed or has error
      }
      
      // Check if there's an active chat or not
      if (activeChat) {
        handleSendMessage()
      } else {
        // No active chat, need to create one
        handleSendMessageToNewChat()
      }
    }
  }

  return {
    chats,
    activeChat,
    messages,
    newMessage,
    loading,
    chatCount,
    researchState,
    handleNewChat,
    handleChatSelect,
    handleSendMessage,
    handleSendMessageToNewChat,
    handleMessageChange,
    handleKeyPress,
    handleSendEmail,
    clearChatData,
    clearActiveChat,
    loadChatsOnDemand
  }
}