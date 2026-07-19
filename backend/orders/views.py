from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order, OrderItem, Coupon
from .serializers import OrderSerializer, CheckoutSerializer, CouponSerializer
from cart.models import Cart


class OrderListView(generics.ListAPIView):
    """Order history for the logged-in user (admins see all orders)."""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=user)


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Order.objects.all() if user.is_staff else Order.objects.filter(user=user)


class OrderStatusUpdateView(APIView):
    """Admin-only: update order status."""
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'detail': 'Not found'}, status=404)
        new_status = request.data.get('status')
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({'detail': 'Invalid status'}, status=400)
        order.status = new_status
        order.save()
        return Response(OrderSerializer(order).data)


class CheckoutView(APIView):
    """Creates an order from the user's current cart, applies a coupon if valid,
    clears the cart, and sends a confirmation email."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'detail': 'Cart is empty'}, status=400)

        items = list(cart.items.all())
        if not items:
            return Response({'detail': 'Cart is empty'}, status=400)

        subtotal = sum(item.subtotal for item in items)
        discount_amount = 0
        coupon = None
        coupon_code = data.get('coupon_code')
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code__iexact=coupon_code, active=True)
                if coupon.valid_until and coupon.valid_until < timezone.now():
                    return Response({'detail': 'Coupon expired'}, status=400)
                discount_amount = subtotal * coupon.discount_percent / 100
            except Coupon.DoesNotExist:
                return Response({'detail': 'Invalid coupon code'}, status=400)

        total = subtotal - discount_amount

        order = Order.objects.create(
            user=request.user,
            shipping_address=data['shipping_address'],
            shipping_city=data['shipping_city'],
            shipping_state=data['shipping_state'],
            shipping_pincode=data['shipping_pincode'],
            phone=data['phone'],
            coupon=coupon,
            subtotal=subtotal,
            discount_amount=discount_amount,
            total=total,
        )
        for item in items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                price=item.product.effective_price,
                quantity=item.quantity,
            )
            # reduce stock
            item.product.stock = max(0, item.product.stock - item.quantity)
            item.product.save()

        cart.items.all().delete()

        # Email confirmation (console backend by default in dev)
        try:
            send_mail(
                subject=f"Order Confirmation #{order.id}",
                message=f"Thanks for your order! Total: ₹{total}. We'll notify you when it ships.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[request.user.email],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class CouponViewSet(viewsets.ModelViewSet):
    """Admin manages coupons; anyone can validate one by code via /validate/."""
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve', 'validate'):
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
