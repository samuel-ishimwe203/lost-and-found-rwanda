import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/auth.service'

const AuthContext = createContext()

export { AuthContext }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      if (token && storedUser) {
        try {
          // Try to parse stored user data
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          setIsAuthenticated(true)
          
          // Optionally verify token is still valid
          try {
            const response = await authService.getCurrentUser()
            if (response && response.user) {
              setUser(response.user)
              localStorage.setItem('user', JSON.stringify(response.user))
            }
          } catch (error) {
            // If verification fails but we have stored data, keep using it
            console.log('Could not verify user, using stored data')
          }
        } catch (error) {
          console.error('Failed to parse stored user:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
          setIsAuthenticated(false)
        }
      } else if (token) {
        // Have token but no stored user, fetch from server
        try {
          const response = await authService.getCurrentUser()
          if (response && response.user) {
            setUser(response.user)
            setIsAuthenticated(true)
            localStorage.setItem('user', JSON.stringify(response.user))
          } else {
            localStorage.removeItem('token')
            setUser(null)
            setIsAuthenticated(false)
          }
        } catch (error) {
          console.error('Failed to fetch user:', error)
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
            setIsAuthenticated(false)
          }
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)
      if (response.data && response.data.user) {
        setUser(response.data.user)
        setIsAuthenticated(true)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.setItem('token', response.data.token)
        return response.data
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      if (response.data && response.data.user) {
        // setUser(response.data.user)
        // setIsAuthenticated(true)
        // localStorage.setItem('token', response.data.token)
        return response.data
      }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      loading,
      login, 
      logout,
      register,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
