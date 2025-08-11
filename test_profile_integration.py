#!/usr/bin/env python
"""
Test script to verify profile integration functionality
"""
import os
import sys
import django
import requests
import json

# Add the backend directory to Python path
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_dir)

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'booklending.settings')

# Setup Django
django.setup()

from django.contrib.auth.models import User
from books.models import UserProfile

def test_backend_integration():
    """Test backend profile integration"""
    print("Testing backend profile integration...")
    
    # Test 1: Check if User model has profile_picture field
    try:
        user_fields = [f.name for f in User._meta.get_fields()]
        if 'profile_picture' in user_fields:
            print("✓ User model has profile_picture field")
        else:
            print("✗ User model missing profile_picture field")
    except Exception as e:
        print(f"✗ Error checking User model: {e}")
    
    # Test 2: Check if UserProfile model exists and works
    try:
        profile_fields = [f.name for f in UserProfile._meta.get_fields()]
        expected_fields = ['bio', 'location', 'phone', 'website', 'preferred_genres']
        missing_fields = [f for f in expected_fields if f not in profile_fields]
        if not missing_fields:
            print("✓ UserProfile model has all required fields")
        else:
            print(f"✗ UserProfile model missing fields: {missing_fields}")
    except Exception as e:
        print(f"✗ Error checking UserProfile model: {e}")
    
    # Test 3: Check media directory
    media_dir = os.path.join(backend_dir, 'media', 'profile_pictures')
    if os.path.exists(media_dir):
        print("✓ Profile pictures media directory exists")
    else:
        print("✗ Profile pictures media directory missing")

def test_api_endpoints():
    """Test API endpoints"""
    print("\nTesting API endpoints...")
    base_url = "http://localhost:8000"
    
    # Test endpoints (without authentication for basic connectivity)
    endpoints = [
        "/api/auth/register/",
        "/api/auth/login/",
        "/api/profiles/my_profile/",
        "/api/auth/update-user/"
    ]
    
    for endpoint in endpoints:
        try:
            # Just check if endpoint exists (will return 401/405 for auth required endpoints)
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            if response.status_code in [200, 401, 405, 403]:
                print(f"✓ Endpoint {endpoint} is accessible")
            else:
                print(f"✗ Endpoint {endpoint} returned {response.status_code}")
        except requests.exceptions.ConnectionError:
            print(f"✗ Cannot connect to {endpoint} - make sure Django server is running")
        except Exception as e:
            print(f"✗ Error testing {endpoint}: {e}")

def main():
    """Run all tests"""
    print("Profile Integration Test Suite")
    print("=" * 40)
    
    test_backend_integration()
    test_api_endpoints()
    
    print("\n" + "=" * 40)
    print("Test completed!")
    print("\nIf you see any ✗ errors above:")
    print("1. Run the setup script first: python setup_profile_integration.py")
    print("2. Make sure Django server is running: python backend/manage.py runserver")
    print("3. Check that all migrations have been applied")

if __name__ == '__main__':
    main()