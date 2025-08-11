#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'booklending.settings')
django.setup()

from django.contrib.auth.models import User
from books.models import Book, Wishlist

def add_matching_books():
    """Add books to the library that match wishlist items"""
    
    # Get or create book owners
    owner1, created = User.objects.get_or_create(
        username='bookowner1',
        defaults={
            'email': 'owner1@example.com',
            'first_name': 'Book',
            'last_name': 'Owner1',
            'password': 'pbkdf2_sha256$600000$test$test'
        }
    )
    
    owner2, created = User.objects.get_or_create(
        username='bookowner2',
        defaults={
            'email': 'owner2@example.com',
            'first_name': 'Book',
            'last_name': 'Owner2',
            'password': 'pbkdf2_sha256$600000$test$test'
        }
    )
    
    # Books that match wishlist items
    matching_books = [
        {
            'title': 'The Great Gatsby',
            'author': 'F. Scott Fitzgerald',
            'isbn': '9780743273565',
            'genre': 'Classic Literature',
            'description': 'A classic American novel set in the Jazz Age.',
            'condition': 'good',
            'lending_type': 'lending',
            'owner': owner1
        },
        {
            'title': '1984',
            'author': 'George Orwell',
            'isbn': '9780451524935',
            'genre': 'Dystopian Fiction',
            'description': 'A dystopian social science fiction novel.',
            'condition': 'like_new',
            'lending_type': 'both',
            'owner': owner2
        },
        {
            'title': 'Pride and Prejudice',
            'author': 'Jane Austen',
            'isbn': '9780141439518',
            'genre': 'Romance',
            'description': 'A romantic novel of manners.',
            'condition': 'good',
            'lending_type': 'lending',
            'owner': owner1
        },
        {
            'title': 'To Kill a Mockingbird',
            'author': 'Harper Lee',
            'isbn': '9780061120084',
            'genre': 'Classic Literature',
            'description': 'A novel about racial injustice and childhood.',
            'condition': 'fair',
            'lending_type': 'swapping',
            'owner': owner2
        }
    ]
    
    # Add books to library
    added_count = 0
    for book_data in matching_books:
        book, created = Book.objects.get_or_create(
            title=book_data['title'],
            author=book_data['author'],
            owner=book_data['owner'],
            defaults={
                'isbn': book_data['isbn'],
                'genre': book_data['genre'],
                'description': book_data['description'],
                'condition': book_data['condition'],
                'lending_type': book_data['lending_type'],
                'availability': 'available'
            }
        )
        
        if created:
            print(f"Added book: {book_data['title']} by {book_data['author']} (Owner: {book_data['owner'].username})")
            added_count += 1
        else:
            print(f"Book already exists: {book_data['title']} by {book_data['author']}")
    
    print(f"\nMatching books setup complete!")
    print(f"Added {added_count} new books to the library")
    print(f"Total books in library: {Book.objects.count()}")
    
    # Show wishlist matches
    print("\nChecking wishlist matches...")
    wishlist_items = Wishlist.objects.all()
    for item in wishlist_items:
        matching_books = Book.objects.filter(
            title__icontains=item.title,
            availability='available'
        ).exclude(owner=item.user)
        
        if matching_books.exists():
            print(f"[MATCH] '{item.title}' by {item.author} - {matching_books.count()} match(es) found")
        else:
            print(f"[NO MATCH] '{item.title}' by {item.author} - No matches found")

if __name__ == '__main__':
    add_matching_books()