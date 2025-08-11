from django.contrib import admin
from .models import Book, BookRequest, BookLoan, UserProfile, Wishlist


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'created_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at']


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'owner', 'condition', 'availability', 'lending_type', 'created_at']
    list_filter = ['condition', 'availability', 'lending_type', 'genre']
    search_fields = ['title', 'author', 'isbn', 'owner__username']
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 25


@admin.register(BookRequest)
class BookRequestAdmin(admin.ModelAdmin):
    list_display = ['book', 'requester', 'request_type', 'status', 'created_at']
    list_filter = ['request_type', 'status', 'created_at']
    search_fields = ['book__title', 'requester__username']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(BookLoan)
class BookLoanAdmin(admin.ModelAdmin):
    list_display = ['book_request', 'due_date', 'return_date', 'returned', 'rating']
    list_filter = ['returned', 'rating', 'created_at']
    readonly_fields = ['created_at']
    date_hierarchy = 'due_date'


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'author', 'created_at']
    search_fields = ['title', 'author', 'user__username']
    list_filter = ['created_at']