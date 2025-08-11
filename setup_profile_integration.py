#!/usr/bin/env python
"""
Setup script to integrate edit profile page with backend and database
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

# Add the backend directory to Python path
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_dir)

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'booklending.settings')

# Setup Django
django.setup()

def main():
    """Run setup tasks"""
    print("Setting up profile integration...")
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    try:
        # Run migrations
        print("Running migrations...")
        execute_from_command_line(['manage.py', 'migrate'])
        
        # Create media directories if they don't exist
        media_dir = os.path.join(backend_dir, 'media', 'profile_pictures')
        os.makedirs(media_dir, exist_ok=True)
        print(f"Created media directory: {media_dir}")
        
        print("Profile integration setup completed successfully!")
        print("\nNext steps:")
        print("1. Start the Django backend: python manage.py runserver")
        print("2. Start the React frontend: npm start")
        print("3. Test the edit profile functionality")
        
    except Exception as e:
        print(f"Error during setup: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()