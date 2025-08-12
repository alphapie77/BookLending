from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q, Count
import requests
from .models import Book, BookRequest, BookLoan, UserProfile, Wishlist
from .serializers import (
    BookSerializer, BookCreateSerializer, BookRequestSerializer, BookLoanSerializer, 
    UserProfileSerializer, WishlistSerializer, UserRegistrationSerializer, UserSerializer
)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'profile_picture': None
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if username and password:
        # Try to authenticate with username first
        user = authenticate(username=username, password=password)
        
        # If that fails, try to find user by email and authenticate
        if not user:
            try:
                user_obj = User.objects.get(email=username)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        
        if user:
            token, created = Token.objects.get_or_create(user=user)
            
            # Get profile picture URL from profile
            profile_picture_url = None
            try:
                profile = UserProfile.objects.get(user=user)
                if profile.profile_picture:
                    profile_picture_url = profile.profile_picture.url
            except UserProfile.DoesNotExist:
                pass
            
            return Response({
                'token': token.key,
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'profile_picture': profile_picture_url
            })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def logout(request):
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Successfully logged out'})
    except:
        return Response({'error': 'Error logging out'}, status=status.HTTP_400_BAD_REQUEST)

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BookCreateSerializer
        elif self.request.method in ['PUT', 'PATCH']:
            return BookCreateSerializer
        return BookSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticatedOrReadOnly()]
    
    def update(self, request, *args, **kwargs):
        book = self.get_object()
        if book.owner != request.user:
            return Response({'error': 'You can only edit your own books'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        book = self.get_object()
        if book.owner != request.user:
            return Response({'error': 'You can only delete your own books'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        print(f"Request data: {self.request.data}")
        print(f"User: {self.request.user}")
        print(f"Serializer data: {serializer.validated_data}")
        try:
            book = serializer.save(owner=self.request.user)
            print(f"Book created: {book.id} - {book.title} by {book.owner}")
            return book
        except Exception as e:
            print(f"Error creating book: {e}")
            import traceback
            print(traceback.format_exc())
            raise
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        available_books = Book.objects.filter(availability='available').exclude(
            owner=request.user if request.user.is_authenticated else None
        )
        serializer = self.get_serializer(available_books, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def genres(self, request):
        genres = Book.objects.values_list('genre', flat=True).distinct().order_by('genre')
        return Response(list(genres))
    
    @action(detail=True, methods=['post'])
    def toggle_availability(self, request, pk=None):
        book = self.get_object()
        if book.owner != request.user:
            return Response({'error': 'You can only modify your own books'}, status=status.HTTP_403_FORBIDDEN)
        
        if book.availability == 'available':
            book.availability = 'unavailable'
        elif book.availability == 'unavailable':
            book.availability = 'available'
        book.save()
        return Response({'status': f'Book marked as {book.availability}'})
    
    @action(detail=False, methods=['get'])
    def my_books(self, request):
        if request.user.is_authenticated:
            my_books = Book.objects.filter(owner=request.user)
            serializer = self.get_serializer(my_books, many=True)
            return Response(serializer.data)
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    def get_paginated_response(self, data):
        if self.action in ['my_books', 'list']:
            return Response(data)
        return super().get_paginated_response(data)
    
    def paginate_queryset(self, queryset):
        if self.action in ['my_books', 'list']:
            return None
        return super().paginate_queryset(queryset)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        genre = request.query_params.get('genre', '')
        author = request.query_params.get('author', '')
        condition = request.query_params.get('condition', '')
        lending_type = request.query_params.get('lending_type', '')
        
        books = Book.objects.filter(availability='available').exclude(owner=request.user if request.user.is_authenticated else None)
        
        if query:
            books = books.filter(
                Q(title__icontains=query) | 
                Q(author__icontains=query) | 
                Q(isbn__icontains=query) |
                Q(description__icontains=query)
            )
        if genre:
            books = books.filter(genre__icontains=genre)
        if author:
            books = books.filter(author__icontains=author)
        if condition:
            books = books.filter(condition=condition)
        if lending_type:
            books = books.filter(lending_type__in=[lending_type, 'both'])
            
        serializer = self.get_serializer(books, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def book_info_api(self, request, pk=None):
        book = self.get_object()
        if book.isbn:
            try:
                # Google Books API integration
                api_url = f"https://www.googleapis.com/books/v1/volumes?q=isbn:{book.isbn}"
                response = requests.get(api_url)
                if response.status_code == 200:
                    data = response.json()
                    if data.get('totalItems', 0) > 0:
                        book_info = data['items'][0]['volumeInfo']
                        return Response({
                            'title': book_info.get('title', ''),
                            'authors': book_info.get('authors', []),
                            'description': book_info.get('description', ''),
                            'publishedDate': book_info.get('publishedDate', ''),
                            'imageLinks': book_info.get('imageLinks', {}),
                            'categories': book_info.get('categories', [])
                        })
            except Exception as e:
                pass
        return Response({'error': 'Book information not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        # Get featured books (most requested or highest rated)
        featured = Book.objects.filter(availability='available').annotate(
            request_count=Count('bookrequest')
        ).order_by('-request_count', '-created_at')[:6]
        serializer = self.get_serializer(featured, many=True)
        return Response(serializer.data)

class BookRequestViewSet(viewsets.ModelViewSet):
    queryset = BookRequest.objects.all()
    serializer_class = BookRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request):
        BookRequest.objects.create(
            book_id=request.data['book'],
            requester=request.user,
            request_type=request.data.get('request_type', 'borrow'),
            message=request.data.get('message', '')
        )
        return Response({'success': True}, status=201)
    

    
    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        my_requests = BookRequest.objects.filter(requester=request.user)
        print(f"Found {my_requests.count()} requests for user {request.user}")
        
        # Simple response without serializer
        requests_data = []
        for req in my_requests:
            requests_data.append({
                'id': req.id,
                'book_title': req.book.title,
                'book_author': req.book.author,
                'request_type': req.request_type,
                'status': req.status,
                'message': req.message,
                'created_at': req.created_at.isoformat()
            })
        
        return Response(requests_data)
    
    @action(detail=False, methods=['get'])
    def incoming_requests(self, request):
        incoming = BookRequest.objects.filter(book__owner=request.user, status='pending')
        serializer = self.get_serializer(incoming, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def accept_request(self, request, pk=None):
        book_request = self.get_object()
        # Only book owner can accept requests
        if book_request.book.owner != request.user:
            return Response({'error': 'Only the book owner can accept requests'}, status=status.HTTP_403_FORBIDDEN)
        
        if book_request.status != 'pending':
            return Response({'error': 'Request is no longer pending'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Check if book is still available
        if book_request.book.availability != 'available':
            return Response({'error': 'Book is no longer available'}, status=status.HTTP_400_BAD_REQUEST)
        
        book_request.status = 'accepted'
        book_request.book.availability = 'borrowed'
        book_request.book.save()
        book_request.save()
        
        # Decline all other pending requests for this book
        BookRequest.objects.filter(
            book=book_request.book, 
            status='pending'
        ).exclude(id=book_request.id).update(status='declined')
        
        # Create loan record
        due_date = timezone.now().date() + timedelta(days=14)  # 2 weeks default
        BookLoan.objects.create(
            book_request=book_request,
            due_date=due_date
        )
        
        return Response({'status': 'request accepted', 'due_date': due_date})
    
    @action(detail=True, methods=['post'])
    def decline_request(self, request, pk=None):
        book_request = self.get_object()
        # Only book owner can decline requests
        if book_request.book.owner != request.user:
            return Response({'error': 'Only the book owner can decline requests'}, status=status.HTTP_403_FORBIDDEN)
            
        if book_request.status != 'pending':
            return Response({'error': 'Request is no longer pending'}, status=status.HTTP_400_BAD_REQUEST)
            
        book_request.status = 'declined'
        book_request.save()
        return Response({'status': 'request declined'})

class BookLoanViewSet(viewsets.ModelViewSet):
    queryset = BookLoan.objects.all()
    serializer_class = BookLoanSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def my_loans(self, request):
        my_loans = BookLoan.objects.filter(book_request__requester=request.user)
        serializer = self.get_serializer(my_loans, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_lent_books(self, request):
        lent_books = BookLoan.objects.filter(book_request__book__owner=request.user)
        serializer = self.get_serializer(lent_books, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def return_book(self, request, pk=None):
        loan = self.get_object()
        if (loan.book_request.requester == request.user or 
            loan.book_request.book.owner == request.user) and not loan.returned:
            loan.returned = True
            loan.return_date = timezone.now().date()
            loan.book_request.book.availability = 'available'
            loan.book_request.status = 'completed'
            
            # Add rating if provided
            rating = request.data.get('rating')
            review = request.data.get('review', '')
            if rating:
                loan.rating = rating
                loan.review = review
            
            loan.book_request.book.save()
            loan.book_request.save()
            loan.save()
            return Response({'status': 'book returned'})
        return Response({'error': 'Cannot return this book'}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=request.user)
        
        serializer = self.get_serializer(profile)
        profile_data = serializer.data
        
        # Add user fields to response
        profile_data.update({
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name
            }
        })
        
        # Add profile picture URL if exists
        if profile.profile_picture:
            profile_data['profile_picture'] = profile.profile_picture.url
        
        return Response(profile_data)

class WishlistViewSet(viewsets.ModelViewSet):
    queryset = Wishlist.objects.all()
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def with_availability(self, request):
        wishlist_items = self.get_queryset()
        result = []
        
        for item in wishlist_items:
            matching_books = Book.objects.filter(
                Q(title__icontains=item.title) | Q(author__icontains=item.author),
                availability='available'
            ).exclude(owner=request.user)[:3]
            
            item_data = WishlistSerializer(item).data
            item_data['available_books'] = BookSerializer(matching_books, many=True).data
            item_data['has_available'] = matching_books.exists()
            result.append(item_data)
        
        return Response(result)
    
    @action(detail=True, methods=['post'])
    def find_matches(self, request, pk=None):
        wishlist_item = self.get_object()
        
        matching_books = Book.objects.filter(
            Q(title__icontains=wishlist_item.title) | 
            Q(author__icontains=wishlist_item.author),
            availability='available'
        ).exclude(owner=request.user)
        
        return Response({
            'wishlist_item': WishlistSerializer(wishlist_item).data,
            'matching_books': BookSerializer(matching_books, many=True).data,
            'count': matching_books.count()
        })

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_statistics(request):
    stats = {
        'total_books': Book.objects.count(),
        'total_users': User.objects.count(),
        'total_loans': BookLoan.objects.count(),
        'active_requests': BookRequest.objects.filter(status='pending').count(),
        'available_books': Book.objects.filter(availability='available').count(),
    }
    return Response(stats)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_featured_books(request):
    try:
        featured = Book.objects.filter(availability='available').order_by('-created_at')[:6]
        serializer = BookSerializer(featured, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response([], status=200)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_book_simple(request):
    try:
        print(f"User: {request.user}")
        print(f"Data: {request.data}")
        
        # Validate required fields
        if not request.data.get('title'):
            return Response({'error': 'Title is required'}, status=400)
        if not request.data.get('author'):
            return Response({'error': 'Author is required'}, status=400)
        if not request.data.get('genre'):
            return Response({'error': 'Genre is required'}, status=400)
            
        book = Book(
            owner=request.user,
            title=request.data.get('title'),
            author=request.data.get('author'),
            isbn=request.data.get('isbn', ''),
            genre=request.data.get('genre'),
            description=request.data.get('description', ''),
            condition=request.data.get('condition', 'good'),
            lending_type=request.data.get('lending_type', 'lending'),
            publication_year=request.data.get('publication_year') or None,
            cover_image_url=request.data.get('cover_image_url', '')
        )
        book.save()
        
        print(f"Book created: {book.id}")
        return Response({'id': book.id, 'title': book.title, 'success': True}, status=201)
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def test_endpoint(request):
    return Response({'message': 'Backend is working', 'books_count': Book.objects.count()})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_book_request(request):
    book_id = request.data.get('book')
    book = Book.objects.get(id=book_id)
    
    book_request = BookRequest.objects.create(
        book=book,
        requester=request.user,
        request_type=request.data.get('request_type', 'borrow'),
        message=request.data.get('message', '')
    )
    
    return Response({'success': True, 'id': book_request.id}, status=201)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_to_wishlist(request):
    title = request.data.get('title')
    author = request.data.get('author')
    isbn = request.data.get('isbn', '')
    
    wishlist_item, created = Wishlist.objects.get_or_create(
        user=request.user,
        title=title,
        author=author,
        defaults={'isbn': isbn}
    )
    
    return Response({
        'id': wishlist_item.id,
        'title': wishlist_item.title,
        'author': wishlist_item.author,
        'created': created
    }, status=201)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def simple_add_book(request):
    try:
        print(f"Request data: {request.data}")
        print(f"User: {request.user}")
        
        book = Book(
            owner=request.user,
            title=request.data.get('title', 'Test Title'),
            author=request.data.get('author', 'Test Author'),
            genre=request.data.get('genre', 'Fiction'),
            isbn=request.data.get('isbn', ''),
            description=request.data.get('description', ''),
            condition=request.data.get('condition', 'good'),
            lending_type=request.data.get('lending_type', 'lending'),
            publication_year=request.data.get('publication_year') or None,
            cover_image_url=request.data.get('cover_image_url', '')
        )
        book.save()
        
        print(f"Book saved: {book.id}")
        
        return Response({
            'id': book.id,
            'title': book.title,
            'author': book.author,
            'success': True
        }, status=201)
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        print(traceback.format_exc())
        return Response({'error': str(e)}, status=500)

@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_user(request):
    try:
        user = request.user
        
        # Update user fields using serializer
        user_data = {
            'first_name': request.data.get('first_name', user.first_name),
            'last_name': request.data.get('last_name', user.last_name),
            'email': request.data.get('email', user.email),
            'username': request.data.get('username', user.username)
        }
        
        user_serializer = UserSerializer(user, data=user_data, partial=True)
        if user_serializer.is_valid():
            user_serializer.save()
        else:
            return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Update profile using serializer
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        profile_data = {
            'bio': request.data.get('bio', profile.bio),
            'location': request.data.get('location', profile.location),
            'phone': request.data.get('phone', profile.phone),
            'website': request.data.get('website', profile.website),
            'preferred_genres': request.data.get('preferred_genres', profile.preferred_genres)
        }
        
        if 'profile_picture' in request.FILES:
            profile_data['profile_picture'] = request.FILES['profile_picture']
        
        profile_serializer = UserProfileSerializer(profile, data=profile_data, partial=True)
        if profile_serializer.is_valid():
            profile_serializer.save()
            
            # Return updated data
            return Response({
                'id': profile.id,
                'bio': profile.bio,
                'location': profile.location,
                'phone': profile.phone,
                'website': profile.website,
                'preferred_genres': profile.preferred_genres,
                'profile_picture': profile.profile_picture.url if profile.profile_picture else None,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            })
        else:
            return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)