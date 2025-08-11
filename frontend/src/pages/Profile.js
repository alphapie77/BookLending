import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { bookService, wishlistService } from '../services/api'
import { User, BookOpen, Heart, Edit3 } from 'lucide-react'

const Profile = () => {
  const { user, userProfile, updateProfile, loadUserProfile } = useAuth()
  const navigate = useNavigate()
  const [myBooks, setMyBooks] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchData()
  }, [])



  const fetchData = async () => {
    try {
      const [booksResponse, wishlistResponse] = await Promise.all([
        bookService.getMyBooks(),
        wishlistService.getWishlist()
      ])
      setMyBooks(booksResponse.data)
      setWishlist(wishlistResponse.data)
      await loadUserProfile()
    } catch (error) {
      console.error('Error fetching profile data:', error)
    } finally {
      setLoading(false)
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
    <div className="relative min-h-screen">
      {/* Hero Section with Modern Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-purple-50">
        {/* Background Decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-violet-300 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-32 right-1/4 w-72 h-72 bg-gradient-to-r from-indigo-300 to-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-8 left-1/4 w-80 h-80 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Profile Header */}
          <div className="bg-white/80 backdrop-blur-sm shadow-2xl overflow-hidden rounded-3xl border border-white/20 mb-8">
            <div className="px-8 py-8">
              {/* Success Message */}
              {success && (
                <div className="mb-6 rounded-2xl bg-green-50 border border-green-200 p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-green-700 font-medium">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                <div className="flex items-center space-x-6">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center relative overflow-hidden border-4 border-white shadow-lg">
                    {userProfile?.profile_picture ? (
                      <img
                        src={userProfile.profile_picture.startsWith('http') 
                          ? userProfile.profile_picture
                          : `http://localhost:8000${userProfile.profile_picture}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-violet-600 text-2xl font-bold">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                      {user?.first_name && user?.last_name 
                        ? `${user.first_name} ${user.last_name}` 
                        : user?.username}
                    </h1>
                    <p className="text-gray-600 text-lg">@{user?.username}</p>
                    {userProfile?.location && (
                      <p className="text-gray-500 mt-1">{userProfile.location}</p>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => navigate('/edit-profile')}
                  className="mt-4 md:mt-0 group relative inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-violet-600 bg-white rounded-2xl shadow-lg border-2 border-violet-200 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-violet-300 hover:bg-violet-50"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              </div>

              <div className="space-y-6">
                {/* User Details Display */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-1">Full Name</h4>
                      <p className="text-gray-900">
                        {user?.first_name || user?.last_name 
                          ? `${user.first_name || ''} ${user.last_name || ''}`.trim() 
                          : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-1">Email</h4>
                      <p className="text-gray-900">{user?.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-1">Phone</h4>
                      <p className="text-gray-900">{userProfile?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-1">Location</h4>
                      <p className="text-gray-900">{userProfile?.location || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                
                {userProfile?.bio && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Bio</h4>
                    <p className="text-gray-900">{userProfile.bio}</p>
                  </div>
                )}
                
                {userProfile?.preferred_genres && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Preferred Genres</h4>
                    <p className="text-gray-900">{userProfile.preferred_genres}</p>
                  </div>
                )}
                
                {userProfile?.website && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Website</h4>
                    <a href={userProfile.website} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700 font-medium">
                      {userProfile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg text-center">
              <BookOpen className="w-12 h-12 text-violet-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">{myBooks.length}</div>
              <div className="text-gray-600">Books Owned</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg text-center">
              <Heart className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">{wishlist.length}</div>
              <div className="text-gray-600">Wishlist Items</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg text-center">
              <User className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
              <div className="text-gray-600">Books Lent</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile