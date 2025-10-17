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
      
      // Check if chat is completed or has error - prevent sending messages
      if (chat.researchState.isCompleted || chat.researchState.hasError) {
        console.log('=== ChatPage: Blocking message send - chat completed or has error ===');
        return
      }

      // If there's an active chat, send message to it
      if (chat.activeChat) {
        await handleChatOperation(() => chat.handleSendMessage())
      } else {
        // No active chat, create new chat and send message
        // This only happens when user types a message, not on empty chats
        await handleChatOperation(() => chat.handleSendMessageToNewChat())
      }
    } catch (error) {
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
      if (error.message === 'Authentication required') {
        logout()
        navigate('/login', { replace: true })
      }
      throw error
    }
  }, [logout, navigate])

  // Handle new chat - DON'T actually create it yet, just clear the UI
  const handleNewChat = useCallback(() => {
    // Clear active chat and messages in the UI
    // Don't create a new chat in the database yet
    chat.clearActiveChat() // You'll need to add this function to your useChat hook
    
    if (ui.isMobile) {
      ui.closeSidebar()
    }
  }, [chat, ui.isMobile, ui.closeSidebar])

  // Handle chat select with mobile sidebar close
  const handleChatSelect = (chatId) => {
    chat.handleChatSelect(chatId)
    if (ui.isMobile) {
      ui.closeSidebar()
    }
  }

  // Handle logout with redirect
  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

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
      onMessageChange={chat.handleMessageChange}
      onKeyPress={chat.handleKeyPress}
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