// In client/src/components/ChatInput.jsx, update the button disabled state

import { useEffect, useRef } from 'react'
import './ChatInput.css'

const ChatInput = ({ message, onMessageChange, onSendMessage, autoFocus = false, researchState }) => {
  const textareaRef = useRef(null)

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  // Determine placeholder text based on research state
  const getPlaceholder = () => {
    if (researchState.awaitingReport) {
      return "Generating research report... Please wait"
    }
    if (!researchState.isResearchMode) {
      return "Enter your research topic or question..."
    } else if (researchState.isWaitingForAnswer && researchState.clarifyingQuestions.length > 0) {
      const currentQuestion = researchState.clarifyingQuestions[researchState.currentQuestionIndex]
      return `Answer: ${currentQuestion}`
    } else {
      return "Enter your research topic or question..."
    }
  }

  // Determine button text based on research state
  const getButtonText = () => {
    if (!researchState.isResearchMode) {
      return "Start Research"
    } else if (researchState.isWaitingForAnswer) {
      return "Answer"
    } else {
      return "Send"
    }
  }

  // Handle keyboard events
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (message.trim() && !isButtonDisabled()) {
        onSendMessage()
      }
    }
  }

  // Check if button should be disabled
  const isButtonDisabled = () => {
    // Disable if no message
    if (!message.trim()) return true
    
    // Disable if chat is completed or has error
    if (researchState.isCompleted || researchState.hasError) return true
    
    // ❌ REMOVE THIS LINE - it was blocking answers:
    // if (researchState.awaitingReport) return true
    
    return false
  }

  // If chat is completed or has error, don't render the input at all
  if (researchState.isCompleted || researchState.hasError) {
    return null
  }

  return (
    <div className="input-container">
      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={onMessageChange}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          className="message-input"
          rows="1"
          disabled={isButtonDisabled()}
        />
        <button 
          onClick={onSendMessage}
          className="send-btn"
          disabled={isButtonDisabled()}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  )
}

export default ChatInput