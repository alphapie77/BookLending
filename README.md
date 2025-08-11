# BookLending Platform

A comprehensive book lending and swapping platform built with Django REST Framework and React. This platform allows users to lend, borrow, and swap books within a community.

## Features

### 🔐 User Authentication & Authorization
- User registration and login
- JWT token-based authentication
- Session management
- User profiles with preferences

### 📚 Book Management
- Add books with detailed information
- Google Books API integration for auto-filling book details
- Book condition tracking
- Photo uploads
- Real-time availability updates

### 🤝 Lending & Borrowing
- Request books for borrowing or swapping
- Accept/decline requests
- Loan tracking with due dates
- Return management with ratings
- Real-time availability updates

### 🔍 Search & Discovery
- Advanced book search by title, author, genre, ISBN
- Browse available books
- Filter by condition, lending type
- Wishlist functionality

### 📊 Dashboard & Analytics
- Personal dashboard with statistics
- Active loans tracking
- Request management
- Borrowing history

## Tech Stack

### Backend
- **Django 5.1.4** - Web framework
- **Django REST Framework** - API development
- **SQLite** - Database (easily configurable to PostgreSQL/MySQL)
- **JWT Authentication** - Secure token-based auth
- **Google Books API** - Book information integration

### Frontend
- **React 19.1.1** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

4. **Create sample data (optional):**
   ```bash
   python create_sample_data.py
   python create_superuser.py
   ```

5. **Start the Django server:**
   ```bash
   python manage.py runserver
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout

### Books
- `GET /api/books/` - List all books
- `POST /api/books/` - Create a new book
- `GET /api/books/{id}/` - Get book details
- `PUT /api/books/{id}/` - Update book
- `DELETE /api/books/{id}/` - Delete book
- `GET /api/books/available/` - Get available books
- `GET /api/books/my_books/` - Get user's books
- `GET /api/books/search/` - Search books
- `GET /api/books/genres/` - Get all genres

### Requests
- `GET /api/requests/` - List all requests
- `POST /api/requests/` - Create a request
- `GET /api/requests/my_requests/` - Get user's requests
- `GET /api/requests/incoming_requests/` - Get incoming requests
- `POST /api/requests/{id}/accept_request/` - Accept request
- `POST /api/requests/{id}/decline_request/` - Decline request

### Loans
- `GET /api/loans/my_loans/` - Get user's loans
- `GET /api/loans/my_lent_books/` - Get lent books
- `POST /api/loans/{id}/return_book/` - Return a book

### Wishlist
- `GET /api/wishlist/my_wishlist/` - Get user's wishlist
- `POST /api/wishlist/` - Add to wishlist
- `DELETE /api/wishlist/{id}/` - Remove from wishlist

## Key Features Implementation

### Real-time Availability
- Books automatically become unavailable when borrowed
- All pending requests for a book are declined when one is accepted
- Availability updates immediately across the platform

### Google Books Integration
- Auto-fill book details using ISBN or title search
- Fetch cover images, descriptions, and metadata
- Seamless integration in the Add Book form

### Advanced Search
- Multi-field search (title, author, ISBN, description)
- Filter by genre, condition, lending type
- Exclude user's own books from search results

### Request Management
- Send requests with custom messages
- Propose book swaps
- Track request status and history
- Automatic loan creation on acceptance

### User Dashboard
- Statistics overview (books owned, active loans, requests)
- Recent activity feed
- Quick action buttons
- Responsive design

## Sample Users

The system comes with sample data including:

**Users:**
- alice / password123
- bob / password123  
- charlie / password123
- admin / admin123 (superuser)

**Sample Books:**
- The Great Gatsby
- To Kill a Mockingbird
- 1984
- Pride and Prejudice
- The Catcher in the Rye
- Harry Potter and the Philosopher's Stone

## Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Database Configuration
The project uses SQLite by default. To use PostgreSQL or MySQL, update the `DATABASES` setting in `settings.py`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.

---

**Happy Reading and Sharing! 📚**