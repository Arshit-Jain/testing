import { useEffect, useRef } from 'react'

const MessageList = ({ messages }) => {
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Alternative: Scroll container directly
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="messages-container" ref={messagesContainerRef}>
      {messages.map((msg, index) => (
        <div key={index} className={`message ${msg.isUser ? 'user' : 'ai'}`}>
          <p>{msg.content}</p>
        </div>
      ))}
      {/* Invisible element at the bottom to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList