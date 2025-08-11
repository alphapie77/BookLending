import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookService } from '../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const searchInputRef = useRef(null);
  const searchDropdownRef = useRef(null);
  const categoriesDropdownRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Book categories
  const categoryGroups = {
    'Genre': [
      { name: 'Fiction', icon: '📚', slug: 'fiction' },
      { name: 'Non-Fiction', icon: '📖', slug: 'non-fiction' },
      { name: 'Mystery', icon: '🔍', slug: 'mystery' },
      { name: 'Romance', icon: '💕', slug: 'romance' },
      { name: 'Science Fiction', icon: '🚀', slug: 'science-fiction' },
      { name: 'Fantasy', icon: '🧙', slug: 'fantasy' }
    ],
    'Type': [
      { name: 'Biography', icon: '👤', slug: 'biography' },
      { name: 'History', icon: '🏛️', slug: 'history' },
      { name: 'Self-Help', icon: '💪', slug: 'self-help' },
      { name: 'Technical', icon: '💻', slug: 'technical' },
      { name: 'Children', icon: '🧸', slug: 'children' },
      { name: 'Educational', icon: '🎓', slug: 'educational' }
    ]
  };

  const allCategories = Object.values(categoryGroups).flat();

  // Search functionality
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    const query = searchQuery.trim();
    
    if (query.length === 0) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }
    
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300);
    
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(event.target)) {
        setIsCategoriesOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setIsCategoriesOpen(false);
        if (searchInputRef.current) {
          searchInputRef.current.blur();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const handleSearch = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const response = await bookService.searchBooks({ q: query });
      setSearchResults(response.data.slice(0, 6));
      setIsSearchOpen(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      setIsSearchOpen(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      setSearchQuery('');
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchResultClick = (bookId) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(`/book/${bookId}`);
  };

  const handleCategoryClick = (categorySlug) => {
    setIsCategoriesOpen(false);
    setIsMenuOpen(false);
    navigate(`/search?genre=${categorySlug}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsCategoriesOpen(false);
    setIsSearchOpen(false);
  };

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-violet-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center" onClick={closeAllMenus}>
                <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent hover:from-violet-700 hover:to-purple-700 transition-all duration-300">
                  📚 BookLending
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {/* Navigation Links */}
              <Link 
                to="/" 
                className="text-gray-600 hover:text-violet-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Home
              </Link>
              {user && (
                <Link 
                  to="/loans" 
                  className="text-gray-600 hover:text-violet-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  My Loans
                </Link>
              )}

              {/* Categories Dropdown */}
              <div className="relative" ref={categoriesDropdownRef}>
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="text-gray-600 hover:text-violet-600 px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center"
                >
                  Categories
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Categories Dropdown Menu */}
                {isCategoriesOpen && (
                  <div className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h3>
                      {Object.entries(categoryGroups).map(([groupName, categories]) => (
                        <div key={groupName} className="mb-4 last:mb-0">
                          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                            {groupName}
                          </h4>
                          <div className="grid grid-cols-3 gap-2">
                            {categories.map((category) => (
                              <button
                                key={category.slug}
                                onClick={() => handleCategoryClick(category.slug)}
                                className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                              >
                                <span className="text-lg mr-2">{category.icon}</span>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-violet-600">
                                  {category.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Modern Search Bar */}
              <div className="relative min-w-0 flex-1 max-w-md" ref={searchDropdownRef}>
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative group">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="✨ Search books, authors, genres..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-12 pr-12 py-3 text-sm bg-gradient-to-r from-gray-50/90 to-gray-50/70 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-sm transition-all duration-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-300 focus:bg-white focus:shadow-xl hover:bg-white hover:shadow-lg hover:border-gray-300 hover:from-white hover:to-white"
                      maxLength={100}
                      autoComplete="off"
                    />
                    {/* Search Icon */}
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      {isSearching ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-violet-400 border-t-transparent"></div>
                      ) : (
                        <svg className="h-4 w-4 text-gray-400 group-focus-within:text-violet-500 group-hover:text-gray-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      )}
                    </div>
                    {/* Clear Button */}
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setIsSearchOpen(false);
                          setSearchResults([]);
                        }}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </form>

                {/* Search Results Dropdown */}
                {isSearchOpen && searchQuery.trim().length >= 2 && (
                  <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-50">
                    {isSearching ? (
                      <div className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-violet-600"></div>
                          <span className="text-sm text-gray-600">Searching books...</span>
                        </div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Search Results
                          </div>
                          <div className="text-xs text-gray-400">
                            {searchResults.length} found
                          </div>
                        </div>
                        {searchResults.map((book) => (
                          <button
                            key={book.id}
                            onClick={() => handleSearchResultClick(book.id)}
                            className="flex items-center w-full p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group border-b border-gray-50 last:border-b-0"
                          >
                            <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg mr-3 flex items-center justify-center overflow-hidden">
                              {book.cover_image ? (
                                <img 
                                  src={book.cover_image} 
                                  alt={book.title} 
                                  className="w-full h-full object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className={`${book.cover_image ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
                                <span className="text-lg">📚</span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 group-hover:text-violet-600 truncate">
                                {book.title}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center mt-1">
                                <span className="mr-3">by {book.author}</span>
                                <span className="capitalize">{book.condition}</span>
                              </div>
                            </div>
                          </button>
                        ))}
                        <div className="border-t border-gray-100 pt-2 mt-2">
                          <button
                            onClick={() => {
                              setIsSearchOpen(false);
                              const currentQuery = searchQuery;
                              setSearchQuery('');
                              navigate(`/search?q=${encodeURIComponent(currentQuery)}`);
                            }}
                            className="w-full text-center text-violet-600 hover:text-violet-700 text-sm font-medium py-2 rounded-md hover:bg-violet-50 transition-colors"
                          >
                            See all results →
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-sm text-gray-500 mb-3">No books found for "{searchQuery}"</p>
                        <button
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery('');
                            navigate('/search');
                          }}
                          className="text-violet-600 hover:text-violet-700 text-sm font-medium py-1 px-3 rounded-md hover:bg-violet-50 transition-colors"
                        >
                          Browse All Books
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Auth Buttons - Desktop */}
            <div className="hidden lg:flex items-center space-x-4">
              {user ? (
                <>
                  <Link 
                    to="/add-book" 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Book
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className="flex items-center space-x-3 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center border-2 border-white shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-violet-600 font-semibold text-sm">
                        {(user?.username?.charAt(0) || 'U').toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden xl:block font-medium">
                      {user?.username || 'Profile'}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-sm font-medium text-gray-600 hover:text-violet-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="inline-flex items-center px-4 py-2 border-2 border-violet-200 text-sm font-medium rounded-xl text-violet-700 bg-white hover:border-violet-300 hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-300 hover:scale-105 shadow-sm"
                  >
                    Join Free
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-violet-500 transition-colors"
              >
                <span className="sr-only">Open main menu</span>
                <svg className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`} fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`} fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200">
            {/* Mobile Search */}
            <div className="px-4 py-3 border-b border-gray-200">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    maxLength={100}
                    autoComplete="off"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </form>
            </div>

            {/* Mobile Navigation */}
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                to="/" 
                onClick={closeAllMenus}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                🏠 Home
              </Link>
              
              {/* Mobile Categories */}
              <div className="px-3 py-2">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Popular Categories
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {allCategories.slice(0, 8).map((category) => (
                    <button
                      key={category.slug}
                      onClick={() => handleCategoryClick(category.slug)}
                      className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <span className="text-lg mr-2">{category.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Auth */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              {user ? (
                <div className="px-2 space-y-1">
                  <Link 
                    to="/add-book" 
                    onClick={closeAllMenus}
                    className="block px-3 py-2 rounded-md text-base font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors"
                  >
                    ➕ Add Book
                  </Link>
                  <Link 
                    to="/dashboard" 
                    onClick={closeAllMenus}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    👤 Dashboard
                  </Link>
                  <Link 
                    to="/loans" 
                    onClick={closeAllMenus}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    📚 My Loans
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              ) : (
                <div className="px-2 space-y-1">
                  <Link 
                    to="/login" 
                    onClick={closeAllMenus}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    🔑 Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={closeAllMenus}
                    className="block px-3 py-2 rounded-md text-base font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors mx-1"
                  >
                    🚀 Join Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop for dropdowns */}
      {(isCategoriesOpen || isSearchOpen) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden"
          onClick={closeAllMenus}
        />
      )}
    </>
  );
};

export default Navbar;