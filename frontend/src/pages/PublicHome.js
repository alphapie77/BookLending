import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { homeService } from '../services/api'
import { BookOpen, Users, TrendingUp, Star, ArrowRight } from 'lucide-react'
import axios from 'axios'

const PublicHome = () => {
  const [stats, setStats] = useState({})
  const [featuredBooks, setFeaturedBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      console.log('Starting to fetch data for PublicHome')
      
      // Try direct axios calls first
      const statsResponse = await axios.get('http://127.0.0.1:8000/api/statistics/')
      const featuredResponse = await axios.get('http://127.0.0.1:8000/api/featured-books/')
      
      console.log('Stats response:', statsResponse.data)
      console.log('Featured books response:', featuredResponse.data)
      setStats(statsResponse.data)
      setFeaturedBooks(featuredResponse.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      console.error('Error details:', error.response?.data, error.response?.status)
      
      // Try with homeService as fallback
      try {
        console.log('Trying with homeService...')
        const [statsResponse, featuredResponse] = await Promise.all([
          homeService.getStatistics(),
          homeService.getFeaturedBooks()
        ])
        setStats(statsResponse.data)
        setFeaturedBooks(featuredResponse.data)
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
        // Set fallback data if API fails
        setStats({
          total_books: 0,
          total_users: 0,
          total_loans: 0
        })
        setFeaturedBooks([])
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              BookLending
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Share books, build community. Discover your next favorite read through our book lending platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-4 bg-white text-violet-600 font-semibold rounded-2xl shadow-lg border-2 border-violet-200 hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 text-center shadow-lg border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.total_books || 0}</h3>
            <p className="text-gray-600">Books Available</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 text-center shadow-lg border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.total_users || 0}</h3>
            <p className="text-gray-600">Active Readers</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 text-center shadow-lg border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.total_loans || 0}</h3>
            <p className="text-gray-600">Books Shared</p>
          </div>
        </div>
      </div>

      {/* Featured Books Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Books</h2>
          <p className="text-xl text-gray-600">Discover popular books in our community</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredBooks.length > 0 ? (
            featuredBooks.slice(0, 6).map((book) => (
              <Link
                key={book.id}
                to={`/book/${book.id}`}
                className="group bg-white/60 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20"
              >
                <div className="h-48 bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center relative">
                  {book.cover_image || book.cover_image_url ? (
                    <img
                      src={book.cover_image || book.cover_image_url}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <BookOpen className="w-16 h-16 text-violet-400 mx-auto mb-2" />
                      <h4 className="text-lg font-semibold text-violet-600 px-2">{book.title}</h4>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm font-medium">4.5</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                  <p className="text-gray-500 text-xs">{book.genre}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-16 h-16 text-violet-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Books Available Yet</h3>
              <p className="text-gray-500">Be the first to add books to our community!</p>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Join to See More Books
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PublicHome