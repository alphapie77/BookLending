import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { bookService, wishlistService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Search, BookOpen, Star, Heart, Filter } from 'lucide-react'

const BookSearch = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    genre: '',
    condition: '',
    lending_type: ''
  })
  const [wishlistItems, setWishlistItems] = useState([])
  const [wishlistLoading, setWishlistLoading] = useState({})

  useEffect(() => {
    // Get search query from URL params if available
    const urlParams = new URLSearchParams(location.search)
    const queryFromUrl = urlParams.get('q')
    if (queryFromUrl) {
      setSearchQuery(queryFromUrl)
      fetchBooks(queryFromUrl)
    } else {
      fetchBooks('', {})
    }
    
    if (user) {
      fetchWishlist()
    }
  }, [location.search, user])

  const fetchBooks = async (query = '', filterParams = {}) => {
    try {
      setLoading(true)
      const params = { 
        q: query, 
        ...filterParams 
      }
      console.log('Search params:', params)
      const response = await bookService.searchBooks(params)
      setBooks(response.data)
    } catch (error) {
      console.error('Failed to fetch books:', error)
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchBooks(searchQuery, filters)
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    fetchBooks(searchQuery, newFilters)
  }

  const fetchWishlist = async () => {
    try {
      const response = await wishlistService.getWishlist()
      setWishlistItems(response.data || [])
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      setWishlistItems([])
    }
  }

  const isInWishlist = (book) => {
    return Array.isArray(wishlistItems) && wishlistItems.some(item => 
      item.title.toLowerCase() === book.title.toLowerCase() && 
      item.author.toLowerCase() === book.author.toLowerCase()
    )
  }

  const toggleWishlist = async (book) => {
    if (!user) {
      navigate('/login')
      return
    }

    setWishlistLoading(prev => ({ ...prev, [book.id]: true }))
    try {
      const inWishlist = isInWishlist(book)
      
      if (inWishlist) {
        const wishlistItem = wishlistItems.find(item => 
          item.title.toLowerCase() === book.title.toLowerCase() && 
          item.author.toLowerCase() === book.author.toLowerCase()
        )
        if (wishlistItem) {
          await wishlistService.removeFromWishlist(wishlistItem.id)
          setWishlistItems(prev => prev.filter(item => item.id !== wishlistItem.id))
        }
      } else {
        const response = await wishlistService.addToWishlist({
          title: book.title,
          author: book.author,
          isbn: book.isbn || ''
        })
        setWishlistItems(prev => [...prev, response.data])
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
    } finally {
      setWishlistLoading(prev => ({ ...prev, [book.id]: false }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-32 right-10 w-80 h-80 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Modern Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 mb-6">
            <BookOpen className="w-4 h-4 mr-2" />
            Community Library
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
            Discover Amazing{' '}
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Books
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Browse through our community's collection of books available for lending and swapping</p>
        </div>

        {/* Modern Search Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-12">
          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Search by title, author, or ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-200 focus:border-violet-500 transition-all bg-white/50 backdrop-blur-sm"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Search
            </button>
          </form>

          {/* Modern Filter Pills */}
          <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200/50">
            <div className="relative">
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                className="appearance-none px-6 py-3 pr-10 bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-200 rounded-full text-violet-700 font-semibold focus:ring-4 focus:ring-violet-200 focus:border-violet-400 transition-all hover:shadow-md cursor-pointer"
              >
                <option value="">📚 All Genres</option>
                <option value="fiction">📖 Fiction</option>
                <option value="non-fiction">📰 Non-Fiction</option>
                <option value="mystery">🔍 Mystery</option>
                <option value="romance">💕 Romance</option>
                <option value="sci-fi">🚀 Sci-Fi</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="relative">
              <select
                value={filters.condition}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
                className="appearance-none px-6 py-3 pr-10 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-full text-green-700 font-semibold focus:ring-4 focus:ring-green-200 focus:border-green-400 transition-all hover:shadow-md cursor-pointer"
              >
                <option value="">✨ Any Condition</option>
                <option value="new">🆕 New</option>
                <option value="like_new">⭐ Like New</option>
                <option value="good">👍 Good</option>
                <option value="fair">👌 Fair</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="relative">
              <select
                value={filters.lending_type}
                onChange={(e) => handleFilterChange('lending_type', e.target.value)}
                className="appearance-none px-6 py-3 pr-10 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-full text-blue-700 font-semibold focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all hover:shadow-md cursor-pointer"
              >
                <option value="">🔄 All Types</option>
                <option value="lending">📤 Lending Only</option>
                <option value="swapping">🔁 Swapping Only</option>
                <option value="both">🎯 Both</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Results */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-violet-200"></div>
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-violet-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {books.map((book) => (
              <Link key={book.id} to={`/book/${book.id}`} className="group block">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2">
                  <div className="relative overflow-hidden">
                    {book.display_image || book.cover_image || book.cover_image_url ? (
                      <img
                        src={book.display_image || book.cover_image || book.cover_image_url}
                        alt={book.title}
                        className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-56 bg-gradient-to-br from-violet-100 via-purple-100 to-pink-100 flex items-center justify-center">
                        <div className="text-center">
                          <BookOpen className="w-16 h-16 text-violet-400 mx-auto mb-2" />
                          <p className="text-violet-500 font-medium">{book.title}</p>
                        </div>
                      </div>
                    )}
                    
                    {book.availability === 'available' && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-green-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg backdrop-blur-sm">
                          ✓ Available
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-violet-600 transition-colors line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 mb-3 font-medium">by {book.author}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-400 to-purple-400 flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {book.owner_name ? book.owner_name.charAt(0).toUpperCase() : 'O'}
                          </span>
                        </div>
                        <span className="text-gray-600 font-medium">{book.owner_name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-yellow-600 ml-1 font-semibold text-sm">4.0</span>
                        </div>
                        {user && book.owner !== user.id && (
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              toggleWishlist(book)
                            }}
                            disabled={wishlistLoading[book.id]}
                            className={`p-2 rounded-full transition-all duration-300 disabled:opacity-50 hover:scale-110 ${
                              isInWishlist(book) 
                                ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                                : 'text-gray-400 bg-gray-50 hover:text-red-500 hover:bg-red-50'
                            }`}
                            title={isInWishlist(book) ? 'Remove from wishlist' : 'Add to wishlist'}
                          >
                            <Heart className={`w-5 h-5 ${isInWishlist(book) ? 'fill-current' : ''}`} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200/50">
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                            book.condition === 'new' ? 'bg-green-100 text-green-800' :
                            book.condition === 'like_new' ? 'bg-blue-100 text-blue-800' :
                            book.condition === 'good' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {book.condition?.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-xs px-3 py-1.5 rounded-full bg-purple-100 text-purple-800 font-semibold">
                            {book.lending_type === 'both' ? 'LEND/SWAP' : book.lending_type?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && books.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-lg max-w-md mx-auto">
              <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-700 mb-3">No books found</h3>
              <p className="text-gray-500 text-lg">Try adjusting your search or filters to discover more books</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookSearch