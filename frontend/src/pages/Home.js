import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Users, Search, ArrowRight, Star, Heart, Zap, Library, BookMarked, UserPlus, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { homeService, wishlistService } from '../services/api'

const Home = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [featuredBooks, setFeaturedBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statistics, setStatistics] = useState({
    total_books: 0,
    total_users: 0,
    total_loans: 0,
    active_requests: 0,
    available_books: 0
  })
  const [wishlistCount, setWishlistCount] = useState(0)
  const [wishlistItems, setWishlistItems] = useState([])
  const [wishlistLoading, setWishlistLoading] = useState({})
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch statistics
        try {
          const statsResponse = await homeService.getStatistics()
          setStatistics(statsResponse.data)
        } catch (err) {
          console.error('Failed to fetch statistics:', err)
        }
        
        // Fetch featured books
        try {
          const booksResponse = await homeService.getFeaturedBooks()
          setFeaturedBooks(booksResponse.data || [])
        } catch (err) {
          console.error('Failed to fetch featured books:', err)
          setFeaturedBooks([])
        }
        
        // Fetch wishlist if authenticated
        if (isAuthenticated) {
          try {
            const wishlistResponse = await wishlistService.getWishlist()
            setWishlistItems(wishlistResponse.data || [])
            setWishlistCount(wishlistResponse.data?.length || 0)
          } catch (err) {
            console.error('Failed to fetch wishlist:', err)
          }
        }
      } catch (err) {
        console.error('General error:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [isAuthenticated])
  
  const isInWishlist = (book) => {
    return wishlistItems.some(item => 
      item.title.toLowerCase() === book.title.toLowerCase() && 
      item.author.toLowerCase() === book.author.toLowerCase()
    )
  }

  const addToWishlist = async (book, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('Button clicked, user:', user)
    
    if (!user) {
      alert('Please login first')
      navigate('/login')
      return
    }

    setWishlistLoading(prev => ({ ...prev, [book.id]: true }))
    
    // Simple direct approach
    try {
      const token = localStorage.getItem('token')
      console.log('Token:', token)
      
      const response = await fetch('http://127.0.0.1:8000/api/add-wishlist/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          title: book.title,
          author: book.author,
          isbn: book.isbn || ''
        })
      })
      
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (response.ok) {
        alert('Added to wishlist!')
        navigate('/wishlist')
      } else {
        alert('Error: ' + (data.error || 'Failed to add'))
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Network error')
    } finally {
      setWishlistLoading(prev => ({ ...prev, [book.id]: false }))
    }
  }
  
  return (
    <div className="relative min-h-screen">
      {/* Hero Section with Colorful Animated Theme */}
      <div className="relative bg-gradient-to-br from-violet-50 via-white to-purple-50 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-32 right-10 w-80 h-80 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-1/2 right-1/3 w-56 h-56 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          {isAuthenticated ? (
            // Logged-in User Hero
            <div>
              <div className="mb-12">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center shadow-lg overflow-hidden">
                    {user?.profile_picture ? (
                      <img
                        src={user.profile_picture.startsWith('http') 
                          ? user.profile_picture
                          : `http://localhost:8000${user.profile_picture}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {(user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      Welcome back, {user?.first_name || user?.username || 'Reader'}!
                    </h1>
                    <p className="text-gray-600 mt-1">What would you like to read today?</p>
                  </div>
                </div>
              </div>
              
              {/* Quick Access Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Link
                  to="/search"
                  className="group bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-violet-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                      <Search className="w-6 h-6 text-violet-600" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">Browse Books</h3>
                  <p className="text-gray-600 text-sm mt-1">Discover books available in your community</p>
                </Link>
                
                <Link
                  to="/dashboard"
                  className="group bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-violet-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Library className="w-6 h-6 text-blue-600" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">My Library</h3>
                  <p className="text-gray-600 text-sm mt-1">Manage your books and requests</p>
                </Link>
                
                <Link
                  to="/wishlist"
                  className="group bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-violet-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Heart className="w-6 h-6 text-green-600" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">My Wishlist</h3>
                  <p className="text-gray-600 text-sm mt-1">{wishlistCount} books you want to read</p>
                </Link>
              </div>
            </div>
          ) : (
            // Guest User Hero
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 mb-8">
                <BookOpen className="w-4 h-4 mr-2" />
                Made with ❤️ for Book Lovers
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-8">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  BookLending
                </span>
              </h1>
              
              <p className="mt-6 max-w-3xl mx-auto text-xl sm:text-2xl leading-relaxed text-gray-600">
                Connecting book lovers through the joy of sharing and discovering great reads.
                <span className="block mt-2 text-lg text-violet-600 font-semibold">
                  Where literary passion meets community spirit.
                </span>
              </p>
              
              <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/search"
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:from-violet-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-violet-300"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Browse Books
                  <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </Link>
                
                <Link
                  to="/register"
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-violet-600 bg-white rounded-2xl shadow-lg border-2 border-violet-200 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-violet-300 hover:bg-violet-50 focus:outline-none focus:ring-4 focus:ring-violet-300"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Get Started
                  <div className="absolute inset-0 rounded-2xl bg-violet-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </Link>
              </div>
            </div>
          )}
            
          {/* Floating Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg text-center">
              <div className="text-3xl font-bold text-gray-900">
                {statistics.total_books > 0 ? 
                  (statistics.total_books >= 1000 ? 
                    `${Math.floor(statistics.total_books / 1000)}K+` : 
                    statistics.total_books) : 
                  '0'
                }
              </div>
              <div className="text-sm text-gray-600">Books</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg text-center">
              <div className="text-3xl font-bold text-gray-900">
                {statistics.total_users > 0 ? 
                  (statistics.total_users >= 1000 ? 
                    `${Math.floor(statistics.total_users / 1000)}K+` : 
                    statistics.total_users) : 
                  '0'
                }
              </div>
              <div className="text-sm text-gray-600">Readers</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg text-center">
              <div className="text-3xl font-bold text-gray-900">
                {statistics.total_loans > 0 ? 
                  (statistics.total_loans >= 1000 ? 
                    `${Math.floor(statistics.total_loans / 1000)}K+` : 
                    statistics.total_loans) : 
                  '0'
                }
              </div>
              <div className="text-sm text-gray-600">Loans</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg text-center">
              <div className="text-3xl font-bold text-gray-900">
                {statistics.available_books > 0 ? 
                  (statistics.available_books >= 1000 ? 
                    `${Math.floor(statistics.available_books / 1000)}K+` : 
                    statistics.available_books) : 
                  '0'
                }
              </div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured Books Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Featured <span className="text-violet-600">Books</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover popular books available in our community
          </p>
        </div>
        
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
          </div>
        )}
        

        
        {!loading && featuredBooks && featuredBooks.length > 0 && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredBooks.map((book) => (
              <Link key={book.id} to={`/book/${book.id}`} className="group block">
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl border border-gray-100">
                  <div className="relative overflow-hidden bg-gray-50 flex items-center justify-center">
                    {book.cover_image ? (
                      <img
                        src={book.display_image || book.cover_image}
                        alt={book.title}
                        className="h-64 w-auto max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div className={`h-64 w-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center ${book.cover_image ? 'hidden' : 'flex'}`}>
                      <div className="text-center">
                        <BookOpen className="w-16 h-16 text-violet-400 mx-auto mb-3" />
                        <span className="text-violet-500 font-semibold text-lg">{book.title}</span>
                        <p className="text-violet-400 text-sm mt-1">by {book.author}</p>
                      </div>
                    </div>
                    
                    <div className="absolute top-4 left-4">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-xs font-semibold text-gray-700">
                            {book.average_rating || '4.0'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {book.availability === 'available' && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          Available
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors duration-300">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      by {book.author}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-400 to-purple-400 flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {book.owner_name ? book.owner_name.charAt(0).toUpperCase() : 'O'}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {book.owner_name || 'Owner'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            alert('Button clicked!')
                            addToWishlist(book, e)
                          }}
                          disabled={wishlistLoading[book.id]}
                          className="p-2 rounded-full transition-all duration-300 disabled:opacity-50 hover:scale-110 text-red-500 bg-red-50 hover:bg-red-100"
                          title="Add to wishlist"
                        >
                          <Heart className="w-4 h-4" />
                        </button>

                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {book.availability === 'available' ? 'Available now' : 'Currently borrowed'}
                        </span>
                        <div className="flex items-center text-violet-600 group-hover:text-violet-700 font-medium">
                          <span className="text-sm mr-1">View Details</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {!loading && (!featuredBooks || featuredBooks.length === 0) && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No books available yet</h3>
            <p className="text-gray-500 mb-6">Be the first to add a book to our community!</p>
            {isAuthenticated && (
              <Link
                to="/add-book"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add First Book
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home