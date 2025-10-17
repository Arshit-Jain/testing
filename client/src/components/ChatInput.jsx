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
      return "Thank you and wait for report to generate"
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
      if (message.trim()) {
        onSendMessage()
      }
    }
  }

  // Check if input should be hidden
  const isHidden = researchState.isCompleted || researchState.hasError

  // If chat is completed or has error, don't render the input at all
  if (isHidden) {
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
        />
        <button 
          onClick={onSendMessage}
          className="send-btn"
          disabled={!message.trim() || researchState.awaitingReport}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  )
}

export default ChatInput