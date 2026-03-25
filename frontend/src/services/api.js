import axios from 'axios'

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Explicit fallback for deployed frontend on Vercel to point to Render backend
    return 'https://lost-and-found-rwanda.onrender.com/api';
  }
  
  return 'http://localhost:3001/api';
};

const API_URL = getApiUrl();

const apiClient = axios.create({
  baseURL: API_URL,
  // Removed the strict 'Content-Type': 'application/json' to allow 
  // Axios to automatically detect FormData and set boundaries
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('API Request:', config.method?.toUpperCase(), config.url, 'Token:', token ? 'Present' : 'Missing')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized - Token might be invalid or expired')
    }
    return Promise.reject(error)
  }
)

export default apiClient


