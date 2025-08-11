import { useState, useEffect } from 'react'
import { requestService, bookService } from '../services/api'
import { MessageSquare, Check, X, Clock, User, RefreshCw } from 'lucide-react'

const Requests = () => {
  const [incomingRequests, setIncomingRequests] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [activeTab, setActiveTab] = useState('incoming')
  const [loading, setLoading] = useState(true)
  const [myBooks, setMyBooks] = useState([])
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [selectedSwapBook, setSelectedSwapBook] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const [incomingRes, myRequestsRes, booksRes] = await Promise.all([
        requestService.getIncomingRequests(),
        requestService.getMyRequests(),
        bookService.getMyBooks()
      ])
      setIncomingRequests(incomingRes.data)
      setMyRequests(myRequestsRes.data)
      setMyBooks(booksRes.data)
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = async (requestId) => {
    try {
      await requestService.acceptRequest(requestId)
      alert('Request accepted successfully!')
      fetchRequests()
    } catch (error) {
      console.error('Error accepting request:', error)
      alert('Error accepting request. Please try again.')
    }
  }

  const handleDeclineRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to decline this request?')) {
      try {
        await requestService.declineRequest(requestId)
        alert('Request declined.')
        fetchRequests()
      } catch (error) {
        console.error('Error declining request:', error)
        alert('Error declining request. Please try again.')
      }
    }
  }

  const handleProposeSwap = (request) => {
    setSelectedRequest(request)
    setShowSwapModal(true)
  }

  const handleSwapProposal = async () => {
    if (!selectedSwapBook) {
      alert('Please select a book to swap')
      return
    }
    try {
      const swapPayload = {
        book: parseInt(selectedRequest.book),
        request_type: 'swap',
        swap_book: parseInt(selectedSwapBook),
        message: `Counter-proposal: I'd like to swap my book for yours instead.`
      }
      console.log('Sending swap payload:', swapPayload)
      await requestService.createRequest(swapPayload)
      await requestService.declineRequest(selectedRequest.id)
      alert('Swap proposal sent!')
      setShowSwapModal(false)
      setSelectedSwapBook('')
      fetchRequests()
    } catch (error) {
      console.error('Error proposing swap:', error)
      alert('Error proposing swap. Please try again.')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />
      case 'accepted': return <Check size={16} />
      case 'declined': return <X size={16} />
      case 'completed': return <Check size={16} />
      default: return <Clock size={16} />
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Book Requests
          </h1>
          <p className="text-xl text-gray-600">
            Manage incoming and outgoing book requests
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
          <div className="flex">
            <button
              onClick={() => setActiveTab('incoming')}
              className={`flex-1 px-6 py-4 text-lg font-semibold rounded-l-2xl transition-all ${
                activeTab === 'incoming' 
                  ? 'bg-violet-600 text-white' 
                  : 'text-gray-600 hover:bg-violet-50'
              }`}
            >
              Incoming Requests ({incomingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('my-requests')}
              className={`flex-1 px-6 py-4 text-lg font-semibold rounded-r-2xl transition-all ${
                activeTab === 'my-requests' 
                  ? 'bg-violet-600 text-white' 
                  : 'text-gray-600 hover:bg-violet-50'
              }`}
            >
              My Requests ({myRequests.length})
            </button>
          </div>
        </div>

        {/* Incoming Requests Tab */}
        {activeTab === 'incoming' && (
          <div>
            {incomingRequests.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-600 mb-2">
                  No incoming requests
                </h3>
                <p className="text-gray-500">
                  When someone requests your books, they'll appear here
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {incomingRequests.map((request) => (
                  <div key={request.id} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {request.book_title}
                        </h3>
                        <p className="text-gray-600 mb-3">
                          by {request.book_author}
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          <User className="w-4 h-4 text-violet-600" />
                          <span className="text-sm text-gray-700">
                            Requested by <span className="font-semibold text-violet-600">{request.requester_name}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {getStatusIcon(request.status)}
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                          <span className="px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm font-medium">
                            {request.request_type.charAt(0).toUpperCase() + request.request_type.slice(1)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {request.message && (
                          <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 mt-4">
                            <p className="text-sm text-gray-700 italic">
                              "{request.message}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="flex justify-end">
                        <button 
                          onClick={() => {
                            setSelectedRequest(request)
                            setShowResponseModal(true)
                          }}
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" /> Respond
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Requests Tab */}
        {activeTab === 'my-requests' && (
          <div>
            {myRequests.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-600 mb-2">
                  No requests sent
                </h3>
                <p className="text-gray-500">
                  Start browsing books to send your first request
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {myRequests.map((request) => (
                  <div key={request.id} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {request.book_title}
                        </h3>
                        <p className="text-gray-600 mb-3">
                          by {request.book_author}
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          <User className="w-4 h-4 text-violet-600" />
                          <span className="text-sm text-gray-700">
                            Owner: <span className="font-semibold text-violet-600">{request.owner_name}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {getStatusIcon(request.status)}
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                          <span className="px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm font-medium">
                            {request.request_type.charAt(0).toUpperCase() + request.request_type.slice(1)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {request.message && (
                          <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4">
                            <p className="text-sm text-gray-700 italic">
                              Your message: "{request.message}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Response Modal */}
        {showResponseModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Respond to Request
              </h3>
              <p className="text-gray-600 mb-6">
                How would you like to respond to the request for "{selectedRequest?.book_title}"?
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    handleAcceptRequest(selectedRequest.id)
                    setShowResponseModal(false)
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white font-semibold rounded-2xl hover:bg-green-700 transition-colors"
                >
                  <Check size={20} /> Accept Request
                </button>
                
                <button
                  onClick={() => {
                    setShowResponseModal(false)
                    handleProposeSwap(selectedRequest)
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-orange-600 text-white font-semibold rounded-2xl hover:bg-orange-700 transition-colors"
                >
                  <RefreshCw size={20} /> Propose Swap Instead
                </button>
                
                <button
                  onClick={() => {
                    handleDeclineRequest(selectedRequest.id)
                    setShowResponseModal(false)
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white font-semibold rounded-2xl hover:bg-red-700 transition-colors"
                >
                  <X size={20} /> Decline Request
                </button>
                
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="w-full px-6 py-4 bg-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Swap Proposal Modal */}
        {showSwapModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Propose Book Swap
              </h3>
              <p className="text-gray-600 mb-6">
                Select one of your books to propose as a swap for "{selectedRequest?.book_title}"
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Your Book to Swap:
                </label>
                <select
                  value={selectedSwapBook}
                  onChange={(e) => setSelectedSwapBook(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="">Select a book...</option>
                  {myBooks.filter(book => book.availability === 'available').map(book => (
                    <option key={book.id} value={book.id}>
                      {book.title} by {book.author}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSwapModal(false)
                    setSelectedSwapBook('')
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSwapProposal}
                  className="flex-1 px-6 py-3 bg-orange-600 text-white font-semibold rounded-2xl hover:bg-orange-700 transition-colors"
                >
                  Propose Swap
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Requests