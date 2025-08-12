import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'
console.log('API Base URL:', API_BASE_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status)
    return response
  },
  (error) => {
    console.error('API Error:', error.config?.url, error.response?.status, error.response?.data)
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user_id')
      localStorage.removeItem('username')
      // Don't auto-redirect, let component handle it
    }
    return Promise.reject(error)
  }
)

// API service functions
export const bookService = {
  getBooks: () => api.get('/api/books/'),
  getBook: (id) => api.get(`/api/books/${id}/`),
  createBook: (data) => {
    console.log('Creating book with data:', data)
    return api.post('/api/create-book-simple/', data)
  },
  updateBook: (id, data) => api.put(`/api/books/${id}/`, data),
  deleteBook: (id) => api.delete(`/api/books/${id}/`),
  getAvailableBooks: () => api.get('/api/books/available/'),
  getMyBooks: () => api.get('/api/books/my_books/'),
  searchBooks: (params) => api.get('/api/books/search/', { params }),
  getBookInfo: (id) => api.get(`/api/books/${id}/book_info_api/`),
}

export const requestService = {
  getRequests: () => api.get('/api/requests/'),
  createRequest: (data) => {
    console.log('Creating request with data:', data)
    return api.post('/api/requests/', data)
  },
  getMyRequests: () => api.get('/api/requests/my_requests/'),
  getIncomingRequests: () => api.get('/api/requests/incoming_requests/'),
  acceptRequest: (id) => api.post(`/api/requests/${id}/accept_request/`),
  declineRequest: (id) => api.post(`/api/requests/${id}/decline_request/`),
}

export const loanService = {
  getLoans: () => api.get('/api/loans/'),
  getMyLoans: () => api.get('/api/loans/my_loans/'),
  getMyLentBooks: () => api.get('/api/loans/my_lent_books/'),
  returnBook: (id) => api.post(`/api/loans/${id}/return_book/`),
}

export const profileService = {
  getProfile: () => api.get('/api/profiles/my_profile/'),
  updateProfile: (data) => {
    // Handle file upload by creating FormData if profile_picture is included
    if (data.profile_picture && data.profile_picture instanceof File) {
      const formData = new FormData()
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key])
        }
      })
      return api.put('/api/profiles/my_profile/', formData)
    }
    return api.put('/api/profiles/my_profile/', data)
  },
}

export const wishlistService = {
  getWishlist: () => {
    console.log('Making wishlist API call to /api/wishlist/')
    return api.get('/api/wishlist/')
  },
  getWishlistWithAvailability: () => {
    console.log('Making wishlist with availability API call')
    return api.get('/api/wishlist/with_availability/')
  },
  addToWishlist: (data) => api.post('/api/add-wishlist/', data),
  removeFromWishlist: (id) => api.delete(`/api/wishlist/${id}/`),
  findMatches: (id) => api.post(`/api/wishlist/${id}/find_matches/`),
}

// Statistics and featured content
export const homeService = {
  getStatistics: () => {
    console.log('Fetching statistics from /api/statistics/')
    return api.get('/api/statistics/')
  },
  getFeaturedBooks: () => {
    console.log('Fetching featured books from /api/featured-books/')
    return api.get('/api/featured-books/')
  },
}

// Google Books API integration
export const googleBooksService = {
  searchBooks: async (query) => {
    try {
      const cleanQuery = query.trim()
      if (!cleanQuery) {
        throw new Error('Query cannot be empty')
      }
      
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(cleanQuery)}&maxResults=10&printType=books`,
        {
          timeout: 10000,
          headers: {
            'Accept': 'application/json'
          }
        }
      )
      
      console.log('Google Books API response:', response.data)
      return response.data
    } catch (error) {
      console.error('Google Books API error:', error)
      throw error
    }
  },
  
  getBookByISBN: async (isbn) => {
    try {
      const cleanISBN = isbn.replace(/[^0-9X]/g, '')
      if (!cleanISBN) {
        throw new Error('Invalid ISBN')
      }
      
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanISBN}`,
        {
          timeout: 10000,
          headers: {
            'Accept': 'application/json'
          }
        }
      )
      
      return response.data
    } catch (error) {
      console.error('Google Books API error:', error)
      throw error
    }
  }
}

export default api