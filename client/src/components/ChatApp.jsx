import { useState, useEffect, useRef } from 'react'
import Sidebar from './Sidebar'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'
import MobileHeader from './MobileHeader'

const ChatApp = ({ 
  chats, 
  activeChat, 
  messages, 
  newMessage,
  user,
  sidebarOpen,
  onNewChat,
  onChatSelect,
  onSendMessage,
  onMessageChange,
  onKeyPress,
  onSendEmail,
  onToggleSidebar,
  onCloseSidebar,
  onLogout,
  chatCount,
  loading,
  researchState
}) => {
  const [shouldFocus, setShouldFocus] = useState(false)
  const messagesEndRef = useRef(null)

  // Smooth fast auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      // Use requestAnimationFrame for smoother scroll
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        })
      })
    }
  }, [messages])

  // Auto-focus when switching to existing chats with messages
  useEffect(() => {
    if (activeChat && messages.length > 0) {
      setShouldFocus(true)
      // Reset focus flag after a short delay
      const timer = setTimeout(() => setShouldFocus(false), 200)
      return () => clearTimeout(timer)
    }
  }, [activeChat, messages.length])

  // Auto-focus when a new empty chat is created (via New Chat button)
  useEffect(() => {
    if (activeChat && messages.length === 0 && chats.length > 0) {
      // Check if this is a newly created chat
      const currentChat = chats.find(chat => chat.id === activeChat)
      if (currentChat) {
        setShouldFocus(true)
        const timer = setTimeout(() => setShouldFocus(false), 200)
        return () => clearTimeout(timer)
      }
    }
  }, [activeChat, messages.length, chats.length])

  return (
    <div className="app">
      {/* Mobile Header */}
      <MobileHeader 
        onNewChat={onNewChat}
        onMenuToggle={onToggleSidebar}
      />

      {/* Sidebar */}
      <Sidebar 
        chats={chats}
        activeChat={activeChat}
        onChatSelect={onChatSelect}
        onNewChat={onNewChat}
        isOpen={sidebarOpen}
        onClose={onCloseSidebar}
        user={user}
        onLogout={onLogout}
        chatCount={chatCount}
        loading={loading}
      />

      {/* Main Chat Area */}
      <div className="main-content">
        <div className="chat-container">
          <div className="messages">
            {messages.map(message => (
              <MessageBubble 
                key={message.id}
                message={message}
                isUser={message.isUser}
              />
            ))}
            
            {/* Loading indicator when API is processing */}
            {loading && (
              <div className="message-bubble ai">
                <div className="message-content loading-message">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <p>Thinking...</p>
                </div>
              </div>
            )}
            
            {/* Invisible element at the bottom to scroll to */}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Email button - show when research is completed */}
          {researchState.isCompleted && !researchState.hasError && (
            <div className="email-section">
              <div className="email-container">
                <div className="email-info">
                  <h3>📧 Research Report Ready</h3>
                  <p>Your research report has been completed. Would you like to receive it via email as a PDF?</p>
                </div>
                <button 
                  className="email-btn"
                  onClick={onSendEmail}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : '📧 Send Report via Email'}
                </button>
              </div>
            </div>
          )}
          
          <ChatInput 
            message={newMessage}
            onMessageChange={onMessageChange}
            onSendMessage={onSendMessage}
            onKeyPress={onKeyPress}
            autoFocus={shouldFocus}
            researchState={researchState}
          />
        </div>
      </div>
    </div>
  )
}

export default ChatApp