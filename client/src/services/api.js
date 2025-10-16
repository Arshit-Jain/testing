import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Authentication API
export const authAPI = {
  async checkAuthStatus() {
    try {
      const response = await apiClient.get('/api/auth/status')
      return response.data
    } catch (error) {
      throw error
    }
  },

  async login(username, password) {
    try {
      const response = await apiClient.post('/api/login', { username, password })
      return response.data
    } catch (error) {
      throw error
    }
  },

  async register(username, email, password) {
    try {
      const response = await apiClient.post('/api/register', { username, email, password })
      return response.data
    } catch (error) {
      throw error
    }
  },

  async logout() {
    try {
      const response = await apiClient.post('/api/logout')
      return response.data
    } catch (error) {
      throw error
    }
  }
}

// Chat API
export const chatAPI = {
  async getChats() {
    try {
      const response = await apiClient.get('/api/chats')
      return response.data
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required')
      }
      throw error
    }
  },

  async createChat(title = "New Chat") {
    try {
      const response = await apiClient.post('/api/chats', { title })
      return response.data
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required')
      }
      if (error.response?.status === 403) {
        throw new Error(error.response.data.error || 'Daily chat limit reached')
      }
      throw error
    }
  },

  async getChatMessages(chatId) {
    try {
      const response = await apiClient.get(`/api/chats/${chatId}/messages`)
      return response.data
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required')
      }
      throw error
    }
  },

  async getChatInfo(chatId) {
    try {
      console.log('=== API: Getting chat info ===', { chatId });
      const response = await apiClient.get(`/api/chats/${chatId}`)
      console.log('=== API: Chat info response ===', response.data);
      return response.data
    } catch (error) {
      console.error('=== API: Chat info error ===', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required')
      }
      throw error
    }
  },

  async sendMessage(chatId, message, messageType = 'regular', additionalData = {}) {
    try {
      console.log('=== API: Sending message ===', { chatId, message, messageType, additionalData });
      const response = await apiClient.post(`/api/chats/${chatId}/messages`, { 
        message, 
        messageType,
        ...additionalData 
      })
      console.log('=== API: Message response ===', response.data);
      return response.data
    } catch (error) {
      console.error('=== API: Message error ===', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required')
      }
      throw error
    }
  },

  async sendResearchTopic(chatId, message) {
    try {
      console.log('=== API: Sending research topic ===', { chatId, message });
      const response = await apiClient.post(`/api/chats/${chatId}/research-topic`, { 
        message 
      })
      console.log('=== API: Research topic response ===', response.data);
      return response.data
    } catch (error) {
      console.error('=== API: Research topic error ===', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required')
      }
      throw error
    }
  },

  async sendClarificationAnswer(chatId, message, questionIndex, totalQuestions, originalTopic, questions, answers) {
    try {
      console.log('=== API: Sending clarification answer ===', { 
        chatId, message, questionIndex, totalQuestions, originalTopic, questions, answers 
      });
      const response = await apiClient.post(`/api/chats/${chatId}/clarification-answer`, { 
        message,
        questionIndex,
        totalQuestions,
        originalTopic,
        questions,
        answers
      })
      console.log('=== API: Clarification answer response ===', response.data);
      return response.data
    } catch (error) {
      console.error('=== API: Clarification answer error ===', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication required')
      }
      throw error
    }
  },

  async getChatCount() {
    try {
      const response = await apiClient.get('/api/user/chat-count')
      return response.data
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required')
      }
      throw error
    }
  },

  async sendResearchReport(chatId) {
    try {
      const response = await apiClient.post(`/api/chats/${chatId}/send-email`)
      return response.data
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required')
      }
      throw error
    }
  }
}
