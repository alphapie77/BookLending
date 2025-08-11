import React, { useState, useEffect } from 'react'
import { loanService } from '../services/api'
import { Clock, BookOpen, Calendar, User, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react'

const Loans = () => {
  const [myLoans, setMyLoans] = useState([])
  const [lentBooks, setLentBooks] = useState([])
  const [activeTab, setActiveTab] = useState('borrowed')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLoans()
  }, [])

  const fetchLoans = async () => {
    try {
      const [myLoansRes, lentBooksRes] = await Promise.all([
        loanService.getMyLoans(),
        loanService.getMyLentBooks()
      ])
      setMyLoans(myLoansRes.data)
      setLentBooks(lentBooksRes.data)
    } catch (error) {
      console.error('Error fetching loans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReturnBook = async (loanId) => {
    if (window.confirm('Mark this book as returned?')) {
      try {
        await loanService.returnBook(loanId)
        alert('Book marked as returned!')
        fetchLoans()
      } catch (error) {
        console.error('Error returning book:', error)
        alert('Error processing return. Please try again.')
      }
    }
  }

  const isOverdue = (dueDate, returned) => {
    return new Date(dueDate) < new Date() && !returned
  }

  const getDaysUntilDue = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="w-10 h-10 mr-4 text-violet-600" />
            Loan Tracking
          </h1>
          <p className="text-gray-600 text-lg">Track your borrowed and lent books with due dates</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/60 backdrop-blur-sm rounded-2xl p-2 border border-white/20 shadow-lg">
            <button
              onClick={() => setActiveTab('borrowed')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'borrowed'
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              Books I Borrowed ({myLoans.length})
            </button>
            <button
              onClick={() => setActiveTab('lent')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'lent'
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              Books I Lent ({lentBooks.length})
            </button>
          </div>
        </div>

        {/* Borrowed Books Tab */}
        {activeTab === 'borrowed' && (
          <div>
            {myLoans.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-lg text-center">
                <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-600 mb-4">No borrowed books</h2>
                <p className="text-gray-500">Books you borrow will appear here with their due dates</p>
              </div>
            ) : (
              <div className="space-y-6">
                {myLoans.map((loan) => {
                  const daysUntilDue = getDaysUntilDue(loan.due_date)
                  const overdue = isOverdue(loan.due_date, loan.returned)
                  
                  return (
                    <div key={loan.id} className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {loan.book_title}
                            </h3>
                            {overdue && (
                              <div className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                <AlertTriangle className="w-4 h-4 mr-1" />
                                Overdue
                              </div>
                            )}
                            {loan.returned && (
                              <div className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Returned
                              </div>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center space-x-3">
                              <User className="w-5 h-5 text-violet-600" />
                              <span className="text-gray-700">
                                <span className="font-medium">Lent by:</span> {loan.lender_name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Calendar className="w-5 h-5 text-violet-600" />
                              <span className="text-gray-700">
                                <span className="font-medium">Borrowed:</span> {new Date(loan.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Calendar className={`w-5 h-5 ${overdue ? 'text-red-500' : 'text-violet-600'}`} />
                              <span className={`${overdue ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
                                <span className="font-medium">Due:</span> {new Date(loan.due_date).toLocaleDateString()}
                                {!loan.returned && (
                                  <span className="ml-2 text-sm">
                                    ({overdue ? `${Math.abs(daysUntilDue)} days overdue` : 
                                      daysUntilDue === 0 ? 'Due today' : 
                                      `${daysUntilDue} days left`})
                                  </span>
                                )}
                              </span>
                            </div>
                            {loan.returned && (
                              <div className="flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="text-green-700 font-medium">
                                  Returned: {new Date(loan.return_date).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {!loan.returned && (
                          <button 
                            onClick={() => handleReturnBook(loan.id)}
                            className="ml-6 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark as Returned
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Lent Books Tab */}
        {activeTab === 'lent' && (
          <div>
            {lentBooks.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-lg text-center">
                <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-600 mb-4">No lent books</h2>
                <p className="text-gray-500">Books you lend to others will appear here with their due dates</p>
              </div>
            ) : (
              <div className="space-y-6">
                {lentBooks.map((loan) => {
                  const daysUntilDue = getDaysUntilDue(loan.due_date)
                  const overdue = isOverdue(loan.due_date, loan.returned)
                  
                  return (
                    <div key={loan.id} className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {loan.book_title}
                            </h3>
                            {overdue && (
                              <div className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                <AlertTriangle className="w-4 h-4 mr-1" />
                                Overdue
                              </div>
                            )}
                            {loan.returned && (
                              <div className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Returned
                              </div>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center space-x-3">
                              <User className="w-5 h-5 text-violet-600" />
                              <span className="text-gray-700">
                                <span className="font-medium">Borrowed by:</span> {loan.borrower_name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Calendar className="w-5 h-5 text-violet-600" />
                              <span className="text-gray-700">
                                <span className="font-medium">Lent:</span> {new Date(loan.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Calendar className={`w-5 h-5 ${overdue ? 'text-red-500' : 'text-violet-600'}`} />
                              <span className={`${overdue ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
                                <span className="font-medium">Due:</span> {new Date(loan.due_date).toLocaleDateString()}
                                {!loan.returned && (
                                  <span className="ml-2 text-sm">
                                    ({overdue ? `${Math.abs(daysUntilDue)} days overdue` : 
                                      daysUntilDue === 0 ? 'Due today' : 
                                      `${daysUntilDue} days left`})
                                  </span>
                                )}
                              </span>
                            </div>
                            {loan.returned && (
                              <div className="flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="text-green-700 font-medium">
                                  Returned: {new Date(loan.return_date).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Summary Stats */}
        {(myLoans.length > 0 || lentBooks.length > 0) && (
          <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Loan Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {myLoans.filter(loan => !loan.returned).length}
                </div>
                <div className="text-gray-600 font-medium">Currently Borrowed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {lentBooks.filter(loan => !loan.returned).length}
                </div>
                <div className="text-gray-600 font-medium">Currently Lent</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {myLoans.filter(loan => loan.returned).length + lentBooks.filter(loan => loan.returned).length}
                </div>
                <div className="text-gray-600 font-medium">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {myLoans.filter(loan => !loan.returned && isOverdue(loan.due_date, loan.returned)).length}
                </div>
                <div className="text-gray-600 font-medium">Overdue</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Loans