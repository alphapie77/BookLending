import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookService, googleBooksService } from '../services/api'
import { Plus, Search, BookOpen, Upload, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const AddBook = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    description: '',
    condition: 'good',
    lending_type: 'lending',
    publication_year: '',
    cover_image: '',
    book_photos: []
  })
  const [photoFiles, setPhotoFiles] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])

  const genres = ['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy', 'Biography', 'History', 'Self-Help', 'Technical', 'Other']
  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ]
  const lendingTypes = [
    { value: 'lending', label: 'Lending Only' },
    { value: 'swapping', label: 'Swapping Only' },
    { value: 'both', label: 'Both Lending & Swapping' }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const searchGoogleBooks = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a book title to search')
      return
    }

    setSearchLoading(true)
    try {
      const data = await googleBooksService.searchBooks(formData.title)
      console.log('Google Books API response:', data)
      if (data && data.items && data.items.length > 0) {
        setSearchResults(data.items)
        toast.success(`Found ${data.items.length} books`)
      } else {
        setSearchResults([])
        toast.info('No books found. Try a different search term.')
      }
    } catch (error) {
      console.error('Error searching books:', error)
      setSearchResults([])
      toast.error('Error searching books. Please check your internet connection.')
    } finally {
      setSearchLoading(false)
    }
  }

  const selectBookFromSearch = (bookInfo) => {
    console.log('Selected book info:', bookInfo)
    
    // Extract publication year from publishedDate
    let publicationYear = ''
    if (bookInfo.publishedDate) {
      const year = bookInfo.publishedDate.match(/\d{4}/)
      publicationYear = year ? year[0] : ''
    }
    
    // Get the best quality image
    const coverImage = bookInfo.imageLinks?.large || 
                      bookInfo.imageLinks?.medium || 
                      bookInfo.imageLinks?.thumbnail || 
                      bookInfo.imageLinks?.smallThumbnail || ''
    
    // Extract ISBN
    const isbn = bookInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier || 
                 bookInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier || ''
    
    // Clean description from HTML tags
    const cleanDescription = bookInfo.description ? 
      bookInfo.description.replace(/<[^>]*>/g, '').substring(0, 500) : ''
    
    // Map Google Books categories to our genres
    const mapGenre = (categories) => {
      if (!categories || !categories[0]) return 'Other'
      const category = categories[0].toLowerCase()
      if (category.includes('fiction') && !category.includes('non')) return 'Fiction'
      if (category.includes('non-fiction') || category.includes('biography') || category.includes('history')) return 'Non-Fiction'
      if (category.includes('mystery') || category.includes('crime')) return 'Mystery'
      if (category.includes('romance')) return 'Romance'
      if (category.includes('science fiction') || category.includes('sci-fi')) return 'Science Fiction'
      if (category.includes('fantasy')) return 'Fantasy'
      if (category.includes('biography')) return 'Biography'
      if (category.includes('history')) return 'History'
      if (category.includes('self-help') || category.includes('self help')) return 'Self-Help'
      if (category.includes('technical') || category.includes('computer') || category.includes('technology')) return 'Technical'
      return 'Other'
    }
    
    const newFormData = {
      title: bookInfo.title || '',
      author: bookInfo.authors ? bookInfo.authors.join(', ') : '',
      description: cleanDescription,
      publication_year: publicationYear,
      cover_image: coverImage,
      genre: mapGenre(bookInfo.categories),
      isbn: isbn,
      condition: formData.condition, // Keep existing condition
      lending_type: formData.lending_type // Keep existing lending type
    }
    
    console.log('Setting form data:', newFormData)
    setFormData(newFormData)
    
    // Clear any existing errors
    setErrors({})
    setSearchResults([])
    toast.success('Book information filled automatically!')
  }

  const validateForm = () => {
    const newErrors = {}
    
    console.log('Validating form data:', formData)
    
    if (!formData.title || !formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters'
    }
    
    if (!formData.author || !formData.author.trim()) {
      newErrors.author = 'Author is required'
    } else if (formData.author.length > 100) {
      newErrors.author = 'Author name must be less than 100 characters'
    }
    
    if (!formData.genre || !formData.genre.trim()) {
      newErrors.genre = 'Genre is required'
    }
    
    if (formData.publication_year) {
      const year = parseInt(formData.publication_year)
      if (isNaN(year) || year < 1000 || year > new Date().getFullYear()) {
        newErrors.publication_year = 'Please enter a valid year between 1000 and ' + new Date().getFullYear()
      }
    }
    
    if (formData.isbn && formData.isbn.length > 13) {
      newErrors.isbn = 'ISBN must be 10 or 13 digits'
    }
    
    if (formData.cover_image && formData.cover_image.trim() && !isValidUrl(formData.cover_image.trim())) {
      newErrors.cover_image = 'Please enter a valid URL'
    }
    
    console.log('Validation errors:', newErrors)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Simple validation
    if (!formData.title || !formData.author || !formData.genre) {
      toast.error('Please fill in title, author, and genre')
      return
    }
    
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Please log in to add a book')
      navigate('/login')
      return
    }
    
    setLoading(true)
    try {
      const bookData = {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn || '',
        genre: formData.genre,
        description: formData.description || '',
        condition: formData.condition,
        lending_type: formData.lending_type,
        publication_year: formData.publication_year ? parseInt(formData.publication_year) : null,
        cover_image: formData.cover_image || ''
      }
      
      console.log('Submitting book data:', bookData)
      console.log('Token:', token)
      const formDataToSend = new FormData()
      
      Object.keys(bookData).forEach(key => {
        if (key === 'cover_image' && bookData[key] instanceof File) {
          formDataToSend.append('cover_image', bookData[key])
        } else if (bookData[key] !== null && bookData[key] !== undefined && bookData[key] !== '') {
          formDataToSend.append(key, bookData[key])
        }
      })
      
      const response = await fetch('http://localhost:8000/api/books/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`
        },
        body: formDataToSend
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(JSON.stringify(errorData))
      }
      
      const responseData = await response.json()
      console.log('Success response:', response.data)
      
      toast.success('Book added successfully!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.response?.data?.error || error.message || 'Failed to add book')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 py-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 mb-6">
            <BookOpen className="w-4 h-4 mr-2" />
            Share Knowledge
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Add New <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Book</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share your books with the community and help others discover great reads
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Plus className="w-6 h-6 mr-3" />
                Book Details
              </h2>
              <p className="text-violet-100 mt-2">Fill in the information about your book</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-8 space-y-6">
                {/* Auto-fill from Google Books */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Search className="w-4 h-4 mr-2 text-blue-600" />
                    Quick Fill from Google Books
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter book title to search..."
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={searchGoogleBooks}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                      disabled={searchLoading}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      {searchLoading ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                    placeholder="Enter book title"
                  />
                  {errors.title && <p className="text-red-600 text-sm mt-2 flex items-center"><X className="w-4 h-4 mr-1" />{errors.title}</p>}
                </div>

                <div>
                  <label htmlFor="author" className="block text-sm font-semibold text-gray-700 mb-2">
                    Author *
                  </label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${errors.author ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                    placeholder="Enter author name"
                  />
                  {errors.author && <p className="text-red-600 text-sm mt-2 flex items-center"><X className="w-4 h-4 mr-1" />{errors.author}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="genre" className="block text-sm font-semibold text-gray-700 mb-2">
                      Genre *
                    </label>
                    <select
                      id="genre"
                      name="genre"
                      value={formData.genre}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${errors.genre ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                    >
                      <option value="">Select genre</option>
                      {genres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                    {errors.genre && <p className="text-red-600 text-sm mt-2 flex items-center"><X className="w-4 h-4 mr-1" />{errors.genre}</p>}
                  </div>

                  <div>
                    <label htmlFor="publication_year" className="block text-sm font-semibold text-gray-700 mb-2">
                      Publication Year
                    </label>
                    <input
                      type="number"
                      id="publication_year"
                      name="publication_year"
                      value={formData.publication_year}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${errors.publication_year ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      placeholder="e.g., 2023"
                      min="1000"
                      max={new Date().getFullYear()}
                    />
                    {errors.publication_year && <p className="text-red-600 text-sm mt-2 flex items-center"><X className="w-4 h-4 mr-1" />{errors.publication_year}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="isbn" className="block text-sm font-semibold text-gray-700 mb-2">
                    ISBN
                  </label>
                  <input
                    type="text"
                    id="isbn"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${errors.isbn ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                    placeholder="Enter ISBN (optional)"
                  />
                  {errors.isbn && <p className="text-red-600 text-sm mt-2 flex items-center"><X className="w-4 h-4 mr-1" />{errors.isbn}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="condition" className="block text-sm font-semibold text-gray-700 mb-2">
                      Condition
                    </label>
                    <select
                      id="condition"
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    >
                      {conditions.map(condition => (
                        <option key={condition.value} value={condition.value}>
                          {condition.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="lending_type" className="block text-sm font-semibold text-gray-700 mb-2">
                      Lending Type
                    </label>
                    <select
                      id="lending_type"
                      name="lending_type"
                      value={formData.lending_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    >
                      {lendingTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    Book Photos
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files)
                      setPhotoFiles(files)
                      setFormData(prev => ({ ...prev, book_photos: files }))
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  />
                  <p className="text-sm text-gray-500 mt-1">Upload multiple photos of your book (optional)</p>
                  {photoFiles.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {photoFiles.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Book photo ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cover Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (file) {
                        setFormData(prev => ({ ...prev, cover_image: file }))
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all mb-3"
                  />
                  <input
                    type="url"
                    id="cover_image"
                    name="cover_image"
                    value={formData.cover_image}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder="Or enter image URL"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                    rows="4"
                    placeholder="Enter book description (optional)"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-100 px-8 pb-8">
                <button 
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Adding Book...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Add Book
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Preview & Search Results */}
          <div className="space-y-8">
            {/* Book Preview */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <BookOpen className="w-6 h-6 mr-3" />
                  Preview
                </h3>
                <p className="text-green-100 mt-2">See how your book will appear</p>
              </div>
              <div className="p-8">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      {formData.cover_image ? (
                        <img 
                          src={formData.cover_image instanceof File ? URL.createObjectURL(formData.cover_image) : formData.cover_image} 
                          alt={formData.title}
                          className="w-32 h-44 object-cover rounded-xl shadow-lg"
                        />
                      ) : (
                        <div className="w-32 h-44 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center shadow-lg">
                          <BookOpen className="w-12 h-12 text-violet-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {formData.title || 'Book Title'}
                      </h3>
                      <p className="text-lg text-gray-600 mb-4">
                        by {formData.author || 'Author Name'}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {formData.genre && (
                          <span className="px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm font-medium">
                            {formData.genre}
                          </span>
                        )}
                        {formData.condition && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            formData.condition === 'new' ? 'bg-green-100 text-green-800' :
                            formData.condition === 'like_new' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {conditions.find(c => c.value === formData.condition)?.label}
                          </span>
                        )}
                        {formData.lending_type && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                            {lendingTypes.find(t => t.value === formData.lending_type)?.label}
                          </span>
                        )}
                      </div>
                      {formData.description && (
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {formData.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6">
                  <h3 className="text-2xl font-bold text-white flex items-center">
                    <Search className="w-6 h-6 mr-3" />
                    Search Results
                  </h3>
                  <p className="text-blue-100 mt-2">
                    Click on a book to auto-fill the form
                  </p>
                </div>
                <div className="p-8">
                  <div className="max-h-96 overflow-y-auto space-y-4">
                    {searchResults.slice(0, 5).map((item, index) => {
                      const book = item.volumeInfo
                      return (
                        <div 
                          key={index}
                          onClick={() => selectBookFromSearch(book)}
                          className="p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all group"
                        >
                          <div className="flex gap-4">
                            {book.imageLinks?.thumbnail && (
                              <img 
                                src={book.imageLinks.thumbnail}
                                alt={book.title}
                                className="w-16 h-20 object-cover rounded-lg shadow-sm"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                                {book.title}
                              </h4>
                              <p className="text-gray-600 text-sm mb-1">
                                {book.authors?.join(', ')}
                              </p>
                              <p className="text-gray-500 text-xs">
                                {book.publishedDate} • {book.categories?.[0]}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddBook