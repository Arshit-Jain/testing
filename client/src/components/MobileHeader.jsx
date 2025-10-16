import './MobileHeader.css'

const MobileHeader = ({ onNewChat, onMenuToggle }) => {
  return (
    <div className="mobile-header">
      <button className="menu-btn" onClick={onMenuToggle}>
        <span></span>
        <span></span>
        <span></span>
      </button>
      <h1 className="app-title">Multi API Research</h1>
      <button className="mobile-new-chat-btn" onClick={onNewChat}>
        <span>+</span>
      </button>
    </div>
  )
}

export default MobileHeader
