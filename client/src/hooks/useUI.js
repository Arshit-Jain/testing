import { useState, useEffect } from 'react'

export const useUI = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const switchToRegistration = () => {
    setShowRegistration(true)
  }

  const switchToLogin = () => {
    setShowRegistration(false)
  }

  return {
    sidebarOpen,
    isMobile,
    showRegistration,
    toggleSidebar,
    closeSidebar,
    switchToRegistration,
    switchToLogin
  }
}
