import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatApp from '../components/ChatApp'
import { useAuth } from '../hooks/useAuth'
import { useChat } from '../hooks/useChat'
import { useUI } from '../hooks/useUI'

const ChatPage = () => {
  const { user, isAuthenticated, checkingAuth, logout } = useAuth()
  const chat = useChat(isAuthenticated)
  const ui = useUI()
  const navigate = useNavigate()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!checkingAuth && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, checkingAuth, navigate])

  // Handle sending messages - create chat only when sending first message
  const handleSendMessage = async () => {
    try {
      if (!chat.newMessage.trim()) return
      
      console.log('=== ChatPage: handleSendMessage called ===', {
        hasActiveChat: !!chat.activeChat,
        messageLength: chat.newMessage.length,
        isCompleted: chat.researchState.isCompleted,
        hasError: chat.researchState.hasError
      })

      // Check if chat is completed or has error - prevent sending messages
      if (chat.researchState.isCompleted || chat.researchState.hasError) {
        console.log('=== ChatPage: Blocking message send - chat completed or has error ===')
        return
      }

      // If there's an active chat, send message to it
      if (chat.activeChat) {
        console.log('=== ChatPage: Sending message to existing chat ===')
        await handleChatOperation(() => chat.handleSendMessage())
      } else {
        // No active chat, create new chat and send message
        console.log('=== ChatPage: Creating new chat ===')
        await handleChatOperation(() => chat.handleSendMessageToNewChat())
      }
    } catch (error) {
      console.error('=== ChatPage: Error in handleSendMessage ===', error)
      if (error.message === 'Authentication required') {
        logout()
        navigate('/login', { replace: true })
      }
    }
  }

  // Handle authentication errors from chat operations
  const handleChatOperation = useCallback(async (operation) => {
    try {
      await operation()
    } catch (error) {
      console.error('=== ChatPage: Chat operation error ===', error)
      if (error.message === 'Authentication required') {
        logout()
        navigate('/login', { replace: true })
      }
      throw error
    }
  }, [logout, navigate])

  // Handle new chat - clear the UI
  const handleNewChat = useCallback(() => {
    console.log('=== ChatPage: handleNewChat called ===')
    chat.clearActiveChat()
    
    if (ui.isMobile) {
      ui.closeSidebar()
    }
  }, [chat, ui])

  // Handle chat select
  const handleChatSelect = useCallback((chatId) => {
    console.log('=== ChatPage: handleChatSelect called ===', { chatId })
    chat.handleChatSelect(chatId)
    if (ui.isMobile) {
      ui.closeSidebar()
    }
  }, [chat, ui])

  // Handle logout
  const handleLogout = useCallback(async () => {
    console.log('=== ChatPage: handleLogout called ===')
    await logout()
    navigate('/login', { replace: true })
  }, [logout, navigate])

  // Handle message change
  const handleMessageChange = useCallback((e) => {
    chat.handleMessageChange(e)
  }, [chat])

  // Handle key press
  const handleKeyPress = useCallback((e) => {
    chat.handleKeyPress(e)
  }, [chat])

  if (checkingAuth) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>
  }

  return (
    <ChatApp
      chats={chat.chats}
      activeChat={chat.activeChat}
      messages={chat.messages}
      newMessage={chat.newMessage}
      user={user}
      sidebarOpen={ui.sidebarOpen}
      isMobile={ui.isMobile}
      onNewChat={handleNewChat}
      onChatSelect={handleChatSelect}
      onSendMessage={handleSendMessage}
      onMessageChange={handleMessageChange}
      onKeyPress={handleKeyPress}
      onSendEmail={chat.handleSendEmail}
      onToggleSidebar={ui.toggleSidebar}
      onCloseSidebar={ui.closeSidebar}
      onLogout={handleLogout}
      chatCount={chat.chatCount}
      loading={chat.loading}
      researchState={chat.researchState}
    />
  )
}

export default ChatPage