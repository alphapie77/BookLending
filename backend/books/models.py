from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

# Remove any dynamic field additions to User model
# Profile picture will be handled through UserProfile model only

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    preferred_genres = models.CharField(max_length=500, blank=True)
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=200, blank=True)
    website = models.URLField(blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

class Book(models.Model):
    CONDITION_CHOICES = [
        ('new', 'New'),
        ('like_new', 'Like New'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
    ]
    
    AVAILABILITY_CHOICES = [
        ('available', 'Available Now'),
        ('borrowed', 'Currently Borrowed'),
        ('unavailable', 'Unavailable'),
    ]
    
    LENDING_TYPE_CHOICES = [
        ('lending', 'Lending Only'),
        ('swapping', 'Swapping Only'),
        ('both', 'Both Lending & Swapping'),
    ]

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_books')
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=100)
    isbn = models.CharField(max_length=13, blank=True)
    genre = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    condition = models.CharField(max_length=10, choices=CONDITION_CHOICES)
    lending_type = models.CharField(max_length=10, choices=LENDING_TYPE_CHOICES)
    availability = models.CharField(max_length=15, choices=AVAILABILITY_CHOICES, default='available')
    publication_year = models.IntegerField(blank=True, null=True)
    cover_image = models.ImageField(upload_to='book_covers/', blank=True, null=True)
    cover_image_url = models.URLField(blank=True)
    book_photos = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} by {self.author}"

class BookRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    REQUEST_TYPE_CHOICES = [
        ('borrow', 'Borrow'),
        ('swap', 'Swap'),
    ]

    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='requests')
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='book_requests')
    request_type = models.CharField(max_length=10, choices=REQUEST_TYPE_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    message = models.TextField(blank=True)
    swap_book = models.ForeignKey(Book, on_delete=models.CASCADE, null=True, blank=True, related_name='swap_requests')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.requester.username} - {self.book.title} ({self.request_type})"

class BookLoan(models.Model):
    book_request = models.OneToOneField(BookRequest, on_delete=models.CASCADE)
    due_date = models.DateField()
    return_date = models.DateField(null=True, blank=True)
    returned = models.BooleanField(default=False)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], null=True, blank=True)
    review = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.book_request.book.title} - {self.book_request.requester.username}"

class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=100, blank=True)
    isbn = models.CharField(max_length=13, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'title', 'author']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"