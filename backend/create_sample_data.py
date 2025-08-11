#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'booklending.settings')
django.setup()

from django.contrib.auth.models import User
from books.models import Book, UserProfile, Wishlist
from datetime import date

def create_sample_data():
    # Create sample users
    users_data = [
        {'username': 'alice', 'email': 'alice@example.com', 'first_name': 'Alice', 'last_name': 'Johnson'},
        {'username': 'bob', 'email': 'bob@example.com', 'first_name': 'Bob', 'last_name': 'Smith'},
        {'username': 'charlie', 'email': 'charlie@example.com', 'first_name': 'Charlie', 'last_name': 'Brown'},
    ]
    
    users = []
    for user_data in users_data:
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults={
                'email': user_data['email'],
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name']
            }
        )
        if created:
            user.set_password('password123')
            user.save()
            # Create user profile
            UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'phone': f'+1234567890{user.id}',
                    'address': f'{user.id}00 Main St, City, State',
                    'preferred_genres': 'Fiction, Mystery, Science Fiction',
                    'bio': f'Book lover and avid reader. Hi, I\'m {user.first_name}!'
                }
            )
        users.append(user)
    
    # Sample books data
    books_data = [
        {
            'title': 'The Great Gatsby',
            'author': 'F. Scott Fitzgerald',
            'isbn': '9780743273565',
            'genre': 'Fiction',
            'description': 'A classic American novel set in the Jazz Age.',
            'condition': 'good',
            'lending_type': 'both',
            'publication_year': 1925,
            'cover_image': 'https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg'
        },
        {
            'title': 'To Kill a Mockingbird',
            'author': 'Harper Lee',
            'isbn': '9780061120084',
            'genre': 'Fiction',
            'description': 'A gripping tale of racial injustice and childhood innocence.',
            'condition': 'like_new',
            'lending_type': 'lending',
            'publication_year': 1960,
            'cover_image': 'https://covers.openlibrary.org/b/isbn/9780061120084-M.jpg'
        },
        {
            'title': '1984',
            'author': 'George Orwell',
            'isbn': '9780451524935',
            'genre': 'Science Fiction',
            'description': 'A dystopian social science fiction novel.',
            'condition': 'good',
            'lending_type': 'both',
            'publication_year': 1949,
            'cover_image': 'https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg'
        },
        {
            'title': 'Pride and Prejudice',
            'author': 'Jane Austen',
            'isbn': '9780141439518',
            'genre': 'Romance',
            'description': 'A romantic novel of manners.',
            'condition': 'fair',
            'lending_type': 'swapping',
            'publication_year': 1813,
            'cover_image': 'https://covers.openlibrary.org/b/isbn/9780141439518-M.jpg'
        },
        {
            'title': 'The Catcher in the Rye',
            'author': 'J.D. Salinger',
            'isbn': '9780316769174',
            'genre': 'Fiction',
            'description': 'A controversial novel about teenage rebellion.',
            'condition': 'good',
            'lending_type': 'lending',
            'publication_year': 1951,
            'cover_image': 'https://covers.openlibrary.org/b/isbn/9780316769174-M.jpg'
        },
        {
            'title': 'Harry Potter and the Philosopher\'s Stone',
            'author': 'J.K. Rowling',
            'isbn': '9780747532699',
            'genre': 'Fantasy',
            'description': 'The first book in the Harry Potter series.',
            'condition': 'new',
            'lending_type': 'both',
            'publication_year': 1997,
            'cover_image': 'https://covers.openlibrary.org/b/isbn/9780747532699-M.jpg'
        }
    ]
    
    # Create books for different users
    for i, book_data in enumerate(books_data):
        owner = users[i % len(users)]
        book, created = Book.objects.get_or_create(
            title=book_data['title'],
            author=book_data['author'],
            owner=owner,
            defaults=book_data
        )
        if created:
            print(f"Created book: {book.title} owned by {owner.username}")
    
    # Create some wishlist items
    wishlist_items = [
        {'user': users[0], 'title': 'Dune', 'author': 'Frank Herbert'},
        {'user': users[0], 'title': 'The Hobbit', 'author': 'J.R.R. Tolkien'},
        {'user': users[1], 'title': 'Brave New World', 'author': 'Aldous Huxley'},
        {'user': users[2], 'title': 'The Lord of the Rings', 'author': 'J.R.R. Tolkien'},
    ]
    
    for item in wishlist_items:
        wishlist, created = Wishlist.objects.get_or_create(
            user=item['user'],
            title=item['title'],
            author=item['author']
        )
        if created:
            print(f"Added to wishlist: {wishlist.title} for {wishlist.user.username}")
    
    print("Sample data created successfully!")

if __name__ == '__main__':
    create_sample_data()