import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'booklending.settings')
django.setup()

from django.contrib.auth.models import User
from books.models import Book

# Create test user
user, created = User.objects.get_or_create(
    username='testuser',
    defaults={'email': 'test@test.com', 'first_name': 'Test', 'last_name': 'User'}
)
if created:
    user.set_password('testpass123')
    user.save()

# Create test books
books_data = [
    {'title': 'The Great Gatsby', 'author': 'F. Scott Fitzgerald', 'genre': 'Fiction'},
    {'title': '1984', 'author': 'George Orwell', 'genre': 'Dystopian'},
    {'title': 'To Kill a Mockingbird', 'author': 'Harper Lee', 'genre': 'Fiction'},
]

for book_data in books_data:
    Book.objects.get_or_create(
        title=book_data['title'],
        defaults={
            'author': book_data['author'],
            'genre': book_data['genre'],
            'condition': 'good',
            'lending_type': 'lending',
            'owner': user
        }
    )

print("Test data created successfully!")