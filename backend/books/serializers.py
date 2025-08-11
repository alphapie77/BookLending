from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Book, BookRequest, BookLoan, UserProfile, Wishlist

class BookCreateSerializer(serializers.ModelSerializer):
    cover_image = serializers.ImageField(required=False, allow_null=True)
    cover_image_url = serializers.URLField(required=False, allow_blank=True)
    
    class Meta:
        model = Book
        fields = ['title', 'author', 'isbn', 'genre', 'description', 'condition', 'lending_type', 'publication_year', 'cover_image', 'cover_image_url']
        extra_kwargs = {
            'isbn': {'required': False, 'allow_blank': True},
            'description': {'required': False, 'allow_blank': True},
            'condition': {'default': 'good'},
            'lending_type': {'default': 'lending'},
            'publication_year': {'required': False, 'allow_null': True}
        }
    
    def create(self, validated_data):
        user = self.context['request'].user
        book = Book.objects.create(owner=user, **validated_data)
        return book

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = UserProfile
        fields = '__all__'
        
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class BookSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    owner_email = serializers.CharField(source='owner.email', read_only=True)
    display_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Book
        exclude = ('owner',)
        read_only_fields = ('created_at', 'updated_at')
    
    def get_display_image(self, obj):
        if obj.cover_image:
            return obj.cover_image.url
        return obj.cover_image_url

class BookRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookRequest
        fields = ['book', 'request_type', 'message']

class BookLoanSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book_request.book.title', read_only=True)
    borrower_name = serializers.CharField(source='book_request.requester.username', read_only=True)
    lender_name = serializers.CharField(source='book_request.book.owner.username', read_only=True)
    
    class Meta:
        model = BookLoan
        fields = '__all__'

class WishlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wishlist
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True}
        }

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        return user