import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { bookService, requestService, loanService } from '../services/api'
import { BookOpen, Plus, Clock, CheckCircle, AlertCircle, Users, User, MessageSquare, Trash2 } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [myBooks, setMyBooks] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [myLoans, setMyLoans] = useState([])
  const [loading, setLoading] = useState(true)

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await bookService.deleteBook(bookId)
        setMyBooks(prev => prev.filter(book => book.id !== bookId))
      } catch (error) {
        console.error('Failed to delete book:', error)
      }
    }
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [booksRes, requestsRes, incomingRes, loansRes] = await Promise.all([
          bookService.getMyBooks(),
          requestService.getMyRequests(),
          requestService.getIncomingRequests(),
          loanService.getMyLoans()
        ])
        
        setMyBooks(booksRes.data)
        setMyRequests(requestsRes.data)
        setIncomingRequests(incomingRes.data)
        setMyLoans(loansRes.data)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-200 border-t-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.first_name || user?.username}!
          </h1>
          <p className="text-gray-600 mt-2">Manage your books and track your reading activity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-violet-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Books</p>
                <p className="text-2xl font-bold text-gray-900">{myBooks.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{myRequests.filter(r => r.status === 'pending').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Incoming Requests</p>
                <p className="text-2xl font-bold text-gray-900">{incomingRequests.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Loans</p>
                <p className="text-2xl font-bold text-gray-900">{myLoans.filter(l => !l.returned).length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/add-book"
              className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Book
            </Link>
            <Link
              to="/books"
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Books
            </Link>
            <Link
              to="/loans"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Clock className="w-4 h-4 mr-2" />
              Track Loans
            </Link>
            <Link
              to="/requests"
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Manage Requests
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <User className="w-4 h-4 mr-2" />
              View Profile
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">My Books</h2>
            </div>
            <div className="p-6">
              {myBooks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myBooks.map((book) => (
                    <div key={book.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow relative group">
                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <Link to={`/books/${book.id}`} className="block">
                        <div className="w-full h-32 bg-gradient-to-br from-violet-100 to-purple-100 rounded mb-3 flex items-center justify-center">
                          {book.cover_image ? (
                            <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover rounded" />
                          ) : (
                            <BookOpen className="w-8 h-8 text-violet-600" />
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">{book.title}</h3>
                        <p className="text-xs text-gray-600 mb-2">by {book.author}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          book.availability === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {book.availability}
                        </span>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">You haven't added any books yet</p>
                  <Link
                    to="/add-book"
                    className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Book
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              {(myRequests.length > 0 || incomingRequests.length > 0) ? (
                <div className="space-y-4">
                  {[...myRequests, ...incomingRequests].slice(0, 4).map((request) => (
                    <div key={request.id} className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${
                        request.status === 'pending' ? 'bg-yellow-400' :
                        request.status === 'accepted' ? 'bg-green-400' :
                        'bg-red-400'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {request.requester_name ? 
                            `${request.requester_name} requested "${request.book_title}"` :
                            `You requested "${request.book_title}"`
                          }
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status}
                        </span>
                        {request.requester_name && request.status === 'pending' && (
                          <Link
                            to="/requests"
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Respond
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard