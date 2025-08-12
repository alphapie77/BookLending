import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookService } from '../services/api'
import { BookOpen, Plus, Edit, Trash2, Eye } from 'lucide-react'

const MyBooks = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyBooks()
  }, [])

  const fetchMyBooks = async () => {
    try {
      const response = await bookService.getMyBooks()
      setBooks(response.data)
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await bookService.deleteBook(bookId)
        setBooks(books.filter(book => book.id !== bookId))
        alert('Book deleted successfully!')
      } catch (error) {
        console.error('Error deleting book:', error)
        alert('Error deleting book. Please try again.')
      }
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>
            My Books
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            Manage your book collection
          </p>
        </div>
        <Link to="/add-book" className="btn btn-primary">
          <Plus size={20} style={{ marginRight: '0.5rem' }} />
          Add New Book
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <BookOpen size={64} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: '#6b7280' }}>
              No books yet
            </h3>
            <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
              Start building your library by adding your first book
            </p>
            <Link to="/add-book" className="btn btn-primary">
              <Plus size={20} style={{ marginRight: '0.5rem' }} />
              Add Your First Book
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-3">
          {books.map((book) => (
            <div key={book.id} className="card book-card">
              {(book.cover_image || book.cover_image_url) && (
                <img 
                  src={book.cover_image || book.cover_image_url} 
                  alt={book.title}
                  className="book-image"
                />
              )}
              <div className="card-body book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">by {book.author}</p>
                <span className="book-genre">{book.genre}</span>
                
                <div style={{ margin: '0.5rem 0' }}>
                  <span className={`book-condition condition-${book.condition}`}>
                    {book.condition.replace('_', ' ')}
                  </span>
                </div>
                
                <div style={{ margin: '0.5rem 0' }}>
                  <span className={`availability-status status-${book.availability}`}>
                    {book.availability === 'available' ? 'Available' : 
                     book.availability === 'borrowed' ? 'Currently Borrowed' : 'Unavailable'}
                  </span>
                </div>
                
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  <strong>Type:</strong> {book.lending_type.replace('_', ' ')}
                </div>
                
                {book.description && (
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280', 
                    marginTop: '0.5rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {book.description}
                  </p>
                )}
              </div>
              
              <div className="card-footer">
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
                  <Link 
                    to={`/book/${book.id}`} 
                    className="btn btn-secondary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                  >
                    <Eye size={16} /> View
                  </Link>
                  <button 
                    onClick={() => handleDelete(book.id)}
                    className="btn btn-danger"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {books.length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-header">
            <h3>Your Library Stats</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-4">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2563eb' }}>
                  {books.length}
                </div>
                <div style={{ color: '#6b7280' }}>Total Books</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#16a34a' }}>
                  {books.filter(book => book.availability === 'available').length}
                </div>
                <div style={{ color: '#6b7280' }}>Available</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
                  {books.filter(book => book.availability === 'borrowed').length}
                </div>
                <div style={{ color: '#6b7280' }}>Borrowed</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#8b5cf6' }}>
                  {new Set(books.map(book => book.genre)).size}
                </div>
                <div style={{ color: '#6b7280' }}>Genres</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyBooks