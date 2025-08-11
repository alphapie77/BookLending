from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from books.models import Book, BookRequest
import json

@csrf_exempt
def simple_login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user = authenticate(username=data['username'], password=data['password'])
        if user:
            return JsonResponse({'success': True, 'user_id': user.id, 'username': user.username})
    return JsonResponse({'success': False})

@csrf_exempt
def simple_books(request):
    books = Book.objects.all()
    books_data = []
    for book in books:
        books_data.append({
            'id': book.id,
            'title': book.title,
            'author': book.author,
            'genre': book.genre,
            'owner': book.owner.username,
            'availability': book.availability
        })
    return JsonResponse({'books': books_data})

@csrf_exempt
def simple_request(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        try:
            book = Book.objects.get(id=data['book'])
            user = User.objects.get(id=data['user_id'])
            
            book_request = BookRequest.objects.create(
                book=book,
                requester=user,
                request_type=data.get('request_type', 'borrow'),
                message=data.get('message', '')
            )
            
            return JsonResponse({'success': True, 'id': book_request.id})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False})