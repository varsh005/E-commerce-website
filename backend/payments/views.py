from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from orders.models import Order
from .models import Payment

try:
    import razorpay
except ImportError:
    razorpay = None


class CreateRazorpayOrderView(APIView):
    """
    Creates a Razorpay order for a given internal Order id.
    Requires `razorpay` package and real API keys in settings/env to actually hit Razorpay;
    without them this returns a clear error so you know to configure keys.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found'}, status=404)

        if razorpay is None:
            return Response(
                {'detail': "razorpay package not installed. Run: pip install razorpay"},
                status=501,
            )
        if settings.RAZORPAY_KEY_ID.startswith('rzp_test_xxxx'):
            return Response(
                {'detail': 'Set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET env vars with real test keys from your Razorpay dashboard.'},
                status=501,
            )

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        razorpay_order = client.order.create({
            'amount': int(order.total * 100),  # paise
            'currency': 'INR',
            'payment_capture': 1,
        })

        Payment.objects.update_or_create(
            order=order,
            defaults={'razorpay_order_id': razorpay_order['id']}
        )

        return Response({
            'razorpay_order_id': razorpay_order['id'],
            'amount': razorpay_order['amount'],
            'currency': razorpay_order['currency'],
            'key_id': settings.RAZORPAY_KEY_ID,
        })


class VerifyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_signature = request.data.get('razorpay_signature')

        try:
            payment = Payment.objects.get(order_id=order_id, order__user=request.user)
        except Payment.DoesNotExist:
            return Response({'detail': 'Payment record not found'}, status=404)

        if razorpay is None:
            return Response({'detail': 'razorpay package not installed'}, status=501)

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        try:
            client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature,
            })
            payment.razorpay_payment_id = razorpay_payment_id
            payment.razorpay_signature = razorpay_signature
            payment.verified = True
            payment.save()

            order = payment.order
            order.status = 'paid'
            order.payment_id = razorpay_payment_id
            order.save()

            return Response({'detail': 'Payment verified', 'status': 'paid'})
        except Exception:
            return Response({'detail': 'Signature verification failed'}, status=400)


class SalesDashboardView(APIView):
    """Admin-only summary stats for the dashboard."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from django.db.models import Sum, Count
        from orders.models import Order
        from products.models import Product

        orders = Order.objects.exclude(status='cancelled')
        total_revenue = orders.aggregate(total=Sum('total'))['total'] or 0
        total_orders = orders.count()
        pending_orders = orders.filter(status='pending').count()
        low_stock = Product.objects.filter(stock__lte=5, is_active=True).count()

        top_products = (
            Order.objects.exclude(status='cancelled')
            .values('items__product__name')
            .annotate(units_sold=Sum('items__quantity'))
            .order_by('-units_sold')[:5]
        )

        return Response({
            'total_revenue': total_revenue,
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'low_stock_products': low_stock,
            'top_products': list(top_products),
        })
