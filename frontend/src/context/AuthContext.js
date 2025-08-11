import { createContext, useContext, useState, useEffect } from 'react'
import api, { profileService } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionExpiry, setSessionExpiry] = useState(null)

  const isAuthenticated = !!user

  // Session management
  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem('token')
      const expiry = localStorage.getItem('session_expiry')
      
      if (token && expiry) {
        const now = new Date().getTime()
        if (now > parseInt(expiry)) {
          logout()
          return
        }
      }
      
      if (token) {
        api.defaults.headers.common['Authorization'] = `Token ${token}`
        const userData = {
          id: localStorage.getItem('user_id'),
          username: localStorage.getItem('username'),
          email: localStorage.getItem('user_email'),
          first_name: localStorage.getItem('user_first_name'),
          last_name: localStorage.getItem('user_last_name'),
          profile_picture: localStorage.getItem('user_profile_picture'),
          token
        }
        setUser(userData)
        loadUserProfile()
      }
      setLoading(false)
    }

    checkSession()
    
    // Check session every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadUserProfile = async () => {
    try {
      const response = await profileService.getProfile()
      setUserProfile(response.data)
      
      // Update user state with profile picture from UserProfile
      if (response.data.profile_picture) {
        setUser(prev => ({
          ...prev,
          profile_picture: response.data.profile_picture
        }))
        localStorage.setItem('user_profile_picture', response.data.profile_picture)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const setSessionExpiryTime = (hours = 24) => {
    const expiry = new Date().getTime() + (hours * 60 * 60 * 1000)
    localStorage.setItem('session_expiry', expiry.toString())
    setSessionExpiry(expiry)
  }

  const login = async (username, password) => {
    try {
      const response = await api.post('/api/auth/login/', { username, password })
      const { token, user_id, username: userName, email, first_name, last_name, profile_picture } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user_id', user_id)
      localStorage.setItem('username', userName)
      localStorage.setItem('user_email', email || '')
      localStorage.setItem('user_first_name', first_name || '')
      localStorage.setItem('user_last_name', last_name || '')
      if (profile_picture) {
        localStorage.setItem('user_profile_picture', profile_picture)
      }
      
      setSessionExpiryTime(24) // 24 hours
      
      api.defaults.headers.common['Authorization'] = `Token ${token}`
      const userData = { 
        id: user_id, 
        username: userName, 
        email: email || '',
        first_name: first_name || '',
        last_name: last_name || '',
        profile_picture: profile_picture || null,
        token 
      }
      setUser(userData)
      
      await loadUserProfile()
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error.response?.data)
      return { 
        success: false, 
        error: error.response?.data?.error || 'Invalid credentials' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/api/auth/register/', userData)
      const { token, user_id, username } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user_id', user_id)
      localStorage.setItem('username', username)
      
      setSessionExpiryTime(24)
      
      api.defaults.headers.common['Authorization'] = `Token ${token}`
      const newUser = { id: user_id, username, token }
      setUser(newUser)
      
      await loadUserProfile()
      
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error.response?.data)
      return { 
        success: false, 
        error: error.response?.data || { general: 'Registration failed' }
      }
    }
  }

  const logout = async () => {
    try {
      await api.post('/api/auth/logout/')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user_id')
      localStorage.removeItem('username')
      localStorage.removeItem('user_email')
      localStorage.removeItem('user_first_name')
      localStorage.removeItem('user_last_name')
      localStorage.removeItem('session_expiry')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
      setUserProfile(null)
      setSessionExpiry(null)
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const formData = new FormData()
      
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== null && profileData[key] !== undefined) {
          formData.append(key, profileData[key])
        }
      })
      
      const response = await api.put('/api/auth/update-user/', formData)
      
      // Update both user and profile states
      setUserProfile(response.data)
      setUser({
        ...user,
        ...response.data.user,
        profile_picture: response.data.profile_picture
      })
      
      // Update localStorage
      const userData = response.data.user
      localStorage.setItem('user_first_name', userData.first_name || '')
      localStorage.setItem('user_last_name', userData.last_name || '')
      localStorage.setItem('user_email', userData.email || '')
      localStorage.setItem('username', userData.username || '')
      if (response.data.profile_picture) {
        localStorage.setItem('user_profile_picture', response.data.profile_picture)
      }
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || { message: 'Update failed' }
      }
    }
  }

  const hasPermission = (action, resource = null) => {
    if (!isAuthenticated) return false
    
    switch (action) {
      case 'lend':
        // User can lend their own books
        return resource && user && resource.owner === parseInt(user.id)
      case 'borrow':
        // User can borrow books they don't own that are available
        return resource && user && resource.owner !== parseInt(user.id) && resource.availability === 'available'
      case 'request_book':
        // User can request books they don't own
        return resource && user && resource.owner !== parseInt(user.id) && resource.availability === 'available'
      case 'accept_request':
        // Only book owner can accept requests
        return resource && user && resource.book?.owner === parseInt(user.id)
      case 'decline_request':
        // Only book owner can decline requests
        return resource && user && resource.book?.owner === parseInt(user.id)
      case 'edit_book':
        return resource && user && resource.owner === parseInt(user.id)
      case 'delete_book':
        return resource && user && resource.owner === parseInt(user.id)
      case 'manage_requests':
        return resource && user && resource.owner === parseInt(user.id)
      case 'toggle_availability':
        return resource && user && resource.owner === parseInt(user.id)
      default:
        return false
    }
  }

  const value = {
    user,
    userProfile,
    isAuthenticated,
    loading,
    sessionExpiry,
    login,
    register,
    logout,
    updateProfile,
    loadUserProfile,
    hasPermission,
    canLend: (book) => hasPermission('lend', book),
    canBorrow: (book) => hasPermission('borrow', book),
    canRequest: (book) => hasPermission('request_book', book)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}