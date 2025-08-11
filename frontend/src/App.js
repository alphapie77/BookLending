import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import PublicHome from './pages/PublicHome'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import BookSearch from './pages/BookSearch'
import BookDetail from './pages/BookDetail'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import MyBooks from './pages/MyBooks'
import AddBook from './pages/AddBook'
import Requests from './pages/Requests'
import Loans from './pages/Loans'
import Wishlist from './pages/Wishlist'
import { AuthProvider, useAuth } from './context/AuthContext'

function AppContent() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-primary-50">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={user ? <Home /> : <PublicHome />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/search" element={<BookSearch />} />
          <Route path="/book/:id" element={<BookDetail />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/edit-profile" element={user ? <EditProfile /> : <Navigate to="/login" />} />
          <Route path="/my-books" element={user ? <MyBooks /> : <Navigate to="/login" />} />
          <Route path="/add-book" element={user ? <AddBook /> : <Navigate to="/login" />} />
          <Route path="/requests" element={user ? <Requests /> : <Navigate to="/login" />} />
          <Route path="/loans" element={user ? <Loans /> : <Navigate to="/login" />} />
          <Route path="/wishlist" element={user ? <Wishlist /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4aed88',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  )
}

export default App