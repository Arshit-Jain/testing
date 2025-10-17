import { useEffect, useRef } from 'react'
import './ChatInput.css'

const ChatInput = ({ message, onMessageChange, onSendMessage, autoFocus = false, researchState }) => {
  const textareaRef = useRef(null)

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  return (
    <div className="input-container">
      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={onMessageChange}
          placeholder="Enter your research topic..."
          className="message-input"
          rows="1"
        />
        <button 
          onClick={onSendMessage}
          className="send-btn"
          disabled={!message.trim()}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatInput