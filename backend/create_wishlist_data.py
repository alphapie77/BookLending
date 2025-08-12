import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'booklending.settings')
django.setup()

from django.contrib.auth.models import User
from books.models import Wishlist

# Get or create test user
user, created = User.objects.get_or_create(
    username='testuser',
    defaults={'email': 'test@test.com', 'first_name': 'Test', 'last_name': 'User'}
)

# Create wishlist items
wishlist_data = [
    {'title': 'The Hobbit', 'author': 'J.R.R. Tolkien', 'isbn': '9780547928227'},
    {'title': 'Dune', 'author': 'Frank Herbert', 'isbn': '9780441172719'},
    {'title': 'The Catcher in the Rye', 'author': 'J.D. Salinger', 'isbn': '9780316769174'},
]

for item_data in wishlist_data:
    Wishlist.objects.get_or_create(
        user=user,
        title=item_data['title'],
        defaults={
            'author': item_data['author'],
            'isbn': item_data['isbn']
        }
    )

print("Wishlist test data created successfully!")