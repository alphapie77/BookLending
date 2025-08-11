import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { bookService, requestService, wishlistService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, User, Calendar, BookOpen, MessageSquare, Heart, Star, Clock, Tag, Settings } from 'lucide-react'

const BookDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, canRequest, hasPermission } = useAuth()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [requestLoading, setRequestLoading] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestData, setRequestData] = useState({
    request_type: 'borrow',
    message: ''
  })
  const [inWishlist, setInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  const checkWishlistStatus = async () => {
    if (!book || !user) {
      setInWishlist(false)
      return
    }
    try {
      const response = await wishlistService.getWishlist()
      const found = response.data?.some(item => 
        item.title.toLowerCase().trim() === book.title.toLowerCase().trim() && 
        item.author.toLowerCase().trim() === book.author.toLowerCase().trim()
      )
      setInWishlist(!!found)
    } catch (error) {
      console.error('Error checking wishlist status:', error)
      setInWishlist(false)
    }
  }

  useEffect(() => {
    fetchBookDetail()
  }, [id])

  useEffect(() => {
    if (book && user) {
      checkWishlistStatus()
    }
  }, [book, user])

  const fetchBookDetail = async () => {
    try {
      const response = await bookService.getBook(id)
      setBook(response.data)
    } catch (error) {
      console.error('Error fetching book:', error)
    } finally {
      setLoading(false)
    }
  }



  const toggleWishlist = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    
    setWishlistLoading(true)
    try {
      if (inWishlist) {
        const response = await wishlistService.getWishlist()
        const wishlistItem = response.data.find(item => 
          item.title.toLowerCase() === book.title.toLowerCase() && 
          item.author.toLowerCase() === book.author.toLowerCase()
        )
        if (wishlistItem) {
          await wishlistService.removeFromWishlist(wishlistItem.id)
          setInWishlist(false)
          alert('Removed from wishlist!')
        }
      } else {
        const response = await wishlistService.addToWishlist({ 
          title: book.title,
          author: book.author,
          isbn: book.isbn || ''
        })
        setInWishlist(true)
        alert('Added to wishlist!')
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      console.error('Error response:', error.response?.data)
      alert(`Error updating wishlist: ${error.response?.data?.error || error.message}`)
    } finally {
      setWishlistLoading(false)
    }
  }

  const handleRequestSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }

    setRequestLoading(true)
    try {
      const response = await requestService.createRequest({
        book: parseInt(book.id),
        request_type: requestData.request_type,
        message: requestData.message || ''
      })
      
      alert('Request sent successfully!')
      setShowRequestForm(false)
      setRequestData({ request_type: 'borrow', message: '' })
    } catch (error) {
      console.error('Error sending request:', error)
      console.error('Error response:', error.response?.data)
      alert(`Error sending request: ${error.response?.data?.error || error.message}`)
    } finally {
      setRequestLoading(false)
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

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Book not found</h2>
          <button onClick={() => navigate(-1)} className="px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const isOwner = user && user.id == book.owner
  const canRequestBook = user && !isOwner && book.availability === 'available'
  const canManageBook = user && isOwner

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={() => navigate(-1)} 
          className="inline-flex items-center px-4 py-2 text-violet-600 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Books
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <div className="flex justify-center lg:justify-start">
            <div className="relative group">
              {book.cover_image ? (
                <img 
                  src={book.cover_image}
                  alt={book.title}
                  className="w-full max-w-md h-auto rounded-3xl shadow-2xl transition-transform duration-500 group-hover:scale-105"
                  style={{ minHeight: '400px', objectFit: 'contain', backgroundColor: '#f8fafc' }}
                />
              ) : (
                <div className="w-full max-w-md h-96 bg-gradient-to-br from-violet-100 to-purple-100 rounded-3xl shadow-2xl flex items-center justify-center">
                  <div className="text-center">
                    <BookOpen className="w-20 h-20 text-violet-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-violet-600 mb-2">{book.title}</h3>
                    <p className="text-violet-500">by {book.author}</p>
                  </div>
                </div>
              )}
              
              <div className="absolute -top-4 -right-4">
                <div className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${
                  book.availability === 'available' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {book.availability === 'available' ? '✓ Available' : 'Not Available'}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3 leading-tight">
                {book.title}
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                by <span className="font-semibold text-violet-600">{book.author}</span>
              </p>
              
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-gray-600 text-sm">(4.5 rating)</span>
                {inWishlist && (
                  <div className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <Heart className="w-4 h-4 mr-1 fill-current" />
                    In Your Wishlist
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium flex items-center">
                <Tag className="w-4 h-4 mr-1" />
                {book.genre}
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                book.condition === 'new' ? 'bg-green-100 text-green-700' :
                book.condition === 'like_new' ? 'bg-blue-100 text-blue-700' :
                book.condition === 'good' ? 'bg-yellow-100 text-yellow-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {book.condition.replace('_', ' ').toUpperCase()}
              </span>
              <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {book.lending_type.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-violet-600" />
                <span className="text-gray-700">
                  <span className="font-semibold">Owner:</span> {book.owner_name}
                </span>
              </div>
              
              {book.publication_year && (
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-violet-600" />
                  <span className="text-gray-700">
                    <span className="font-semibold">Published:</span> {book.publication_year}
                  </span>
                </div>
              )}
              
              {book.isbn && (
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-violet-600" />
                  <span className="text-gray-700">
                    <span className="font-semibold">ISBN:</span> {book.isbn}
                  </span>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-violet-600" />
                <span className="text-gray-700">
                  <span className="font-semibold">Added:</span> {new Date(book.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {canRequestBook && (
                <button 
                  onClick={() => setShowRequestForm(true)}
                  className="flex-1 inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Request Book
                </button>
              )}
              {canManageBook && (
                <button className="flex-1 inline-flex items-center justify-center px-6 py-4 bg-green-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <Settings className="w-5 h-5 mr-2" />
                  Manage Book
                </button>
              )}
              {user && !isOwner && (
                <button 
                  onClick={toggleWishlist}
                  disabled={wishlistLoading || inWishlist}
                  className={`flex-1 inline-flex items-center justify-center px-6 py-4 font-semibold rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    inWishlist 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white text-violet-600 border-2 border-violet-200 hover:shadow-xl hover:border-violet-300'
                  }`}
                >
                  <Heart className={`w-5 h-5 mr-2 ${inWishlist ? 'fill-current' : ''}`} />
                  {wishlistLoading ? 'Loading...' : inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                </button>
              )}
            </div>
          </div>
        </div>

        {book.description && (
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <BookOpen className="w-6 h-6 mr-3 text-violet-600" />
              About This Book
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              {book.description}
            </p>
          </div>
        )}

        {showRequestForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Request "{book.title}"</h3>
              </div>
              <form onSubmit={handleRequestSubmit}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Request Type</label>
                    <select
                      value={requestData.request_type}
                      onChange={(e) => setRequestData(prev => ({ ...prev, request_type: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    >
                      <option value="borrow">Borrow</option>
                      <option value="swap">Swap</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Message (Optional)</label>
                    <textarea
                      value={requestData.message}
                      onChange={(e) => setRequestData(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                      rows="3"
                      placeholder="Add a message to the book owner..."
                    />
                  </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="flex-1 px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50"
                    disabled={requestLoading}
                  >
                    {requestLoading ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookDetail