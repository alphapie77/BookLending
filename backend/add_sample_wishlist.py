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
from books.models import Wishlist

def add_sample_wishlist_data():
    """Add sample wishlist data for testing"""
    
    # Get or create a test user
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User'
        }
    )
    
    if created:
        user.set_password('testpass123')
        user.save()
        print(f"Created test user: {user.username}")
    else:
        print(f"Using existing user: {user.username}")
    
    # Sample wishlist books
    sample_books = [
        {
            'title': 'The Great Gatsby',
            'author': 'F. Scott Fitzgerald',
            'isbn': '9780743273565'
        },
        {
            'title': 'To Kill a Mockingbird',
            'author': 'Harper Lee',
            'isbn': '9780061120084'
        },
        {
            'title': '1984',
            'author': 'George Orwell',
            'isbn': '9780451524935'
        },
        {
            'title': 'Pride and Prejudice',
            'author': 'Jane Austen',
            'isbn': '9780141439518'
        },
        {
            'title': 'The Catcher in the Rye',
            'author': 'J.D. Salinger',
            'isbn': '9780316769174'
        }
    ]
    
    # Add books to wishlist
    added_count = 0
    for book_data in sample_books:
        wishlist_item, created = Wishlist.objects.get_or_create(
            user=user,
            title=book_data['title'],
            author=book_data['author'],
            defaults={'isbn': book_data['isbn']}
        )
        
        if created:
            print(f"Added to wishlist: {book_data['title']} by {book_data['author']}")
            added_count += 1
        else:
            print(f"Already in wishlist: {book_data['title']} by {book_data['author']}")
    
    print(f"\nSample wishlist data setup complete!")
    print(f"Added {added_count} new books to {user.username}'s wishlist")
    print(f"Total wishlist items for {user.username}: {Wishlist.objects.filter(user=user).count()}")

if __name__ == '__main__':
    add_sample_wishlist_data()