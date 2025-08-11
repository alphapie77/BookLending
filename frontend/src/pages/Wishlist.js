import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { wishlistService, bookService } from '../services/api'
import { Heart, BookOpen, Trash2, Eye, Search, Calendar, User, ExternalLink } from 'lucide-react'

const Wishlist = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [availableBooks, setAvailableBooks] = useState([])
  const [searchingBooks, setSearchingBooks] = useState({})

  useEffect(() => {
    if (user) {
      fetchWishlist()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchWishlist = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    try {
      // Try to get wishlist with availability information first
      const response = await wishlistService.getWishlistWithAvailability()
      setWishlist(response.data || [])
      
      // Pre-populate available books data
      const availableBooksData = {}
      response.data?.forEach(item => {
        if (item.available_books && item.available_books.length > 0) {
          availableBooksData[item.id] = item.available_books
        }
      })
      setAvailableBooks(availableBooksData)
    } catch (error) {
      console.error('Error fetching wishlist with availability:', error)
      // Fallback to regular wishlist if enhanced endpoint fails
      try {
        const response = await wishlistService.getWishlist()
        setWishlist(response.data || [])
      } catch (fallbackError) {
        console.error('Error fetching wishlist:', fallbackError)
        setWishlist([])
      }
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (id) => {
    try {
      await wishlistService.removeFromWishlist(id)
      setWishlist(prev => prev.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      alert('Error removing from wishlist. Please try again.')
    }
  }

  const searchForBook = async (wishlistItem) => {
    setSearchingBooks(prev => ({ ...prev, [wishlistItem.id]: true }))
    try {
      const response = await wishlistService.findMatches(wishlistItem.id)
      
      if (response.data.matching_books && response.data.matching_books.length > 0) {
        setAvailableBooks(prev => ({ ...prev, [wishlistItem.id]: response.data.matching_books }))
      } else {
        alert('No matching books found in the library.')
      }
    } catch (error) {
      console.error('Error searching for book:', error)
      alert('Error searching for books. Please try again.')
    } finally {
      setSearchingBooks(prev => ({ ...prev, [wishlistItem.id]: false }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center">
            <Heart className="w-10 h-10 mr-4 text-red-500" />
            My Wishlist
          </h1>
          <p className="text-gray-600 text-lg">Books you want to read</p>
        </div>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div key={item.id} className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-white/20">
                <div className="h-48 bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center relative">
                  <div className="text-center">
                    <BookOpen className="w-16 h-16 text-violet-400 mx-auto mb-2" />
                    <h4 className="text-lg font-semibold text-violet-600 px-2">{item.title}</h4>
                  </div>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-2 flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {item.author}
                  </p>
                  {item.isbn && (
                    <p className="text-xs text-gray-500 mb-3 flex items-center">
                      <BookOpen className="w-3 h-3 mr-1" />
                      ISBN: {item.isbn}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mb-4 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Added {new Date(item.created_at).toLocaleDateString()}
                  </p>
                  
                  <div className="space-y-2">
                    {/* Show available books if already found, otherwise show search button */}
                    {availableBooks[item.id] && availableBooks[item.id].length > 0 ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-green-700 text-sm font-medium mb-2">
                          {availableBooks[item.id].length} matching book(s) available!
                        </p>
                        <div className="space-y-1">
                          {availableBooks[item.id].slice(0, 2).map((book) => (
                            <Link
                              key={book.id}
                              to={`/book/${book.id}`}
                              className="block text-xs text-green-600 hover:text-green-800 hover:underline flex items-center"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              {book.title} by {book.owner_name}
                            </Link>
                          ))}
                          {availableBooks[item.id].length > 2 && (
                            <button
                              onClick={() => navigate(`/search?q=${encodeURIComponent(item.title + ' ' + item.author)}`)}
                              className="text-xs text-green-600 hover:text-green-800 hover:underline"
                            >
                              View all {availableBooks[item.id].length} results
                            </button>
                          )}
                        </div>
                      </div>
                    ) : item.has_available ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-blue-700 text-sm font-medium mb-2">
                          Books available in library!
                        </p>
                        <button
                          onClick={() => searchForBook(item)}
                          disabled={searchingBooks[item.id]}
                          className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center text-sm"
                        >
                          {searchingBooks[item.id] ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              View Available
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => searchForBook(item)}
                        disabled={searchingBooks[item.id]}
                        className="w-full px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
                      >
                        {searchingBooks[item.id] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <>
                            <Search className="w-4 h-4 mr-2" />
                            Find in Library
                          </>
                        )}
                      </button>
                    )}

                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-lg text-center">
            <Heart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-600 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Start adding books you'd like to read!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/search"
                className="inline-flex items-center px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors font-semibold"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Browse Books
              </Link>
              <Link
                to="/add-book"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
              >
                <Heart className="w-5 h-5 mr-2" />
                Add Your Books
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist