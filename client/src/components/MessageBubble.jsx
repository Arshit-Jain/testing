import './MessageBubble.css'

const MessageBubble = ({ message, isUser }) => {
  // Check if the message contains markdown formatting (research page)
  const isResearchPage = message.text && (
    message.text.includes('#') || 
    message.text.includes('##') || 
    message.text.includes('**') ||
    message.text.includes('*') ||
    message.text.includes('- ')
  )

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'ai'}`}>
      <div className={`message-content ${isResearchPage ? 'research-content' : ''}`}>
        {isResearchPage ? (
          <div 
            className="markdown-content"
            dangerouslySetInnerHTML={{ 
              __html: message.text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                .replace(/^- (.*$)/gim, '<li>$1</li>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br>')
                .replace(/^(.*)$/gim, '<p>$1</p>')
            }}
          />
        ) : (
          message.text
        )}
      </div>
    </div>
  )
}

export default MessageBubble
