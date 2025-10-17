import { useEffect, useRef } from 'react'
import './ChatInput.css'

const ChatInput = ({ message, onMessageChange, onSendMessage, autoFocus = false, researchState }) => {
  const textareaRef = useRef(null)

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  // Get placeholder text
  const getPlaceholder = () => {
    if (!researchState) return "Enter your research topic..."
    
    if (researchState.awaitingReport) {
      return "Generating research report... Please wait"
    }
    
    if (!researchState.isResearchMode) {
      return "Enter your research topic or question..."
    } 
    
    if (researchState.isWaitingForAnswer && researchState.clarifyingQuestions && researchState.clarifyingQuestions.length > 0) {
      const currentQuestion = researchState.clarifyingQuestions[researchState.currentQuestionIndex]
      return `Answer: ${currentQuestion}`
    }
    
    return "Enter your research topic or question..."
  }

  // Get button text
  const getButtonText = () => {
    if (!researchState) return "Send"
    
    if (!researchState.isResearchMode) {
      return "Start Research"
    } 
    
    if (researchState.isWaitingForAnswer) {
      return "Answer"
    }
    
    return "Send"
  }

  // Handle keyboard - send on Enter (not Shift+Enter)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (message.trim() && !isDisabled()) {
        onSendMessage()
      }
    }
  }

  // Determine if button should be disabled
  const isDisabled = () => {
    // Always allow if there's a message
    if (!message.trim()) return true
    
    // Block if completed or error
    if (researchState && (researchState.isCompleted || researchState.hasError)) {
      return true
    }
    
    return false
  }

  // Don't render input if chat is completed
  if (researchState && (researchState.isCompleted || researchState.hasError)) {
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
          disabled={isDisabled()}
        />
        <button 
          onClick={onSendMessage}
          className="send-btn"
          disabled={isDisabled()}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  )
}

export default ChatInput