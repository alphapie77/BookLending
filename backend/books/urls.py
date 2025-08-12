from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BookViewSet, BookLoanViewSet, BookRequestViewSet, 
    UserProfileViewSet, WishlistViewSet, register, login, logout,
    get_statistics, get_featured_books, create_book_simple, update_user, create_book_request, test_endpoint, add_to_wishlist, simple_add_book
)

router = DefaultRouter()
router.register(r'books', BookViewSet)
router.register(r'loans', BookLoanViewSet)
router.register(r'requests', BookRequestViewSet)
router.register(r'profiles', UserProfileViewSet)
router.register(r'wishlist', WishlistViewSet)

# Simple endpoints
from simple_views import simple_login, simple_books, simple_request

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/auth/register/', register, name='register'),
    path('api/auth/login/', login, name='login'),
    path('api/auth/logout/', logout, name='logout'),
    path('api/statistics/', get_statistics, name='statistics'),
    path('api/featured-books/', get_featured_books, name='featured-books'),
    path('api/create-book-simple/', create_book_simple, name='create-book-simple'),
    path('api/test/', test_endpoint, name='test'),
    path('api/book-request/', create_book_request, name='book-request'),
    path('api/add-wishlist/', add_to_wishlist, name='add-wishlist'),
    path('api/simple-add-book/', simple_add_book, name='simple-add-book'),
    path('api/auth/update-user/', update_user, name='update-user'),
]