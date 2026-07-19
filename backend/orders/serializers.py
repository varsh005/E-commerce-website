from rest_framework import serializers
from .models import Order, OrderItem, Coupon


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'price', 'quantity']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_display = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'status', 'user_display', 'shipping_address', 'shipping_city', 'shipping_state',
                  'shipping_pincode', 'phone', 'coupon', 'subtotal', 'discount_amount',
                  'total', 'payment_id', 'items', 'created_at']
        read_only_fields = ['status', 'subtotal', 'discount_amount', 'total', 'payment_id']


class CheckoutSerializer(serializers.Serializer):
    shipping_address = serializers.CharField()
    shipping_city = serializers.CharField()
    shipping_state = serializers.CharField()
    shipping_pincode = serializers.CharField()
    phone = serializers.CharField()
    coupon_code = serializers.CharField(required=False, allow_blank=True)


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'discount_percent', 'active', 'valid_until']
