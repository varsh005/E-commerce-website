from rest_framework import serializers
from .models import Category, Product, ProductImage, Review, Wishlist


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'product', 'user', 'username', 'rating', 'comment', 'created_at']
        read_only_fields = ['user']


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    average_rating = serializers.ReadOnlyField()
    effective_price = serializers.ReadOnlyField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'category', 'category_name', 'price',
                  'discount_price', 'effective_price', 'stock', 'image',
                  'average_rating', 'is_active']

    def get_image(self, obj):
        # Prefer the embedded base64 image (used by seeded/demo products — works
        # everywhere with no external storage dependency); fall back to a normal
        # uploaded file (used when someone uploads a photo via the admin panel).
        if obj.image_data:
            return obj.image_data
        if obj.image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.ReadOnlyField()
    effective_price = serializers.ReadOnlyField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'category', 'description', 'price',
                  'discount_price', 'effective_price', 'stock', 'image', 'images',
                  'reviews', 'average_rating', 'is_active', 'created_at']

    def get_image(self, obj):
        if obj.image_data:
            return obj.image_data
        if obj.image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None


class ProductAdminSerializer(serializers.ModelSerializer):
    """Full write-access serializer used by admin CRUD endpoints."""
    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'category', 'description', 'price',
                  'discount_price', 'stock', 'image', 'is_active']


class WishlistSerializer(serializers.ModelSerializer):
    product_detail = ProductListSerializer(source='product', read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'product_detail', 'added_at']
