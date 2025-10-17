import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Get token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

// Set token in localStorage
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token)
  } else {
    localStorage.removeItem('authToken')
  }
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})


export const authAPI = {
  async checkAuthStatus() {
    try {
      const response = await apiClient.get('/api/auth/status')
      return response.data
    } catch (error) {
      console.error('❌ Auth status check failed:', error.response?.data || error.message)
      throw error
    }
  },

  async login(username, password) {
    try {
      const response = await apiClient.post('/api/login', { username, password })
      if (response.data.success && response.data.token) {
        setAuthToken(response.data.token)
      }
      return response.data
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message)
      throw error
    }
  },

  async register(username, email, password) {
    try {
      const response = await apiClient.post('/api/register', { username, email, password })
      if (response.data.success && response.data.token) {
        setAuthToken(response.data.token)
      }
      return response.data
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data || error.message)
      throw error
    }
  },

  async logout() {
    try {
      setAuthToken(null)
      const response = await apiClient.post('/api/auth/logout')
      return response.data
    } catch (error) {
      console.error('❌ Logout failed:', error.response?.data || error.message)
      throw error
    }
  },
}

// -----------------------------
// 💬 CHAT API
// -----------------------------
export const chatAPI = {
  async getChats() {
    try {
      const response = await apiClient.get('/api/chats')
      return response.data
    } catch (error) {
      if (error.response?.status === 401) throw new Error('Authentication required')
      throw error
    }
  },

  async createChat(title = 'New Chat') {
    try {
      const response = await apiClient.post('/api/chats', { title })
      return response.data
    } catch (error) {
      if (error.response?.status === 401) throw new Error('Authentication required')
      if (error.response?.status === 403)
        throw new Error(error.response.data.error || 'Daily chat limit reached')
      throw error
    }
  },

  async getChatMessages(chatId) {
    try {
      const response = await apiClient.get(`/api/chats/${chatId}/messages`)
      return response.data
    } catch (error) {
      if (error.response?.status === 401) throw new Error('Authentication required')
      throw error
    }
  },

  async getChatInfo(chatId) {
    try {
      const response = await apiClient.get(`/api/chats/${chatId}`)
      return response.data
    } catch (error) {
      if (error.response?.status === 401) throw new Error('Authentication required')
      throw error
    }
  },

  async sendMessage(chatId, message, messageType = 'regular', additionalData = {}) {
    try {
      const response = await apiClient.post(`/api/chats/${chatId}/messages`, {
        message,
        messageType,
        ...additionalData,
      })
      return response.data
    } catch (error) {
      if (error.response?.status === 401) throw new Error('Authentication required')
      throw error
    }
  },

  async sendResearchTopic(chatId, message) {
    try {
      const response = await apiClient.post(`/api/chats/${chatId}/research-topic`, { message })
      return response.data
    } catch (error) {
      if (error.response?.status === 401) throw new Error('Authentication required')
      throw error
    }
  },

  async sendClarificationAnswer(
    chatId,
    message,
    questionIndex,
    totalQuestions,
    originalTopic,
    questions,
    answers
  ) {
    try {
      const response = await apiClient.post(`/api/chats/${chatId}/clarification-answer`, {
        message,
        questionIndex,
        totalQuestions,
        originalTopic,
        questions,
        answers,
      })
      return response.data
    } catch (error) {
      if (error.response?.status === 401) throw new Error('Authentication required')
      throw error
    }
  },

  async getChatCount() {
    try {
      const response = await apiClient.get('/api/user/chat-count')
      return response.data
    } catch (error) {
      if (error.response?.status === 401) throw new Error('Authentication required')
      throw error
    }
  },

  async sendResearchReport(chatId) {
    try {
      const response = await apiClient.post(`/api/chats/${chatId}/send-email`)
      return response.data
    } catch (error) {
      if (error.response?.status === 401) throw new Error('Authentication required')
      throw error
    }
  },
}