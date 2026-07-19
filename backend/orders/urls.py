from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderListView, OrderDetailView, OrderStatusUpdateView, CheckoutView, CouponViewSet

router = DefaultRouter()
router.register('coupons', CouponViewSet, basename='coupon')

urlpatterns = [
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('history/', OrderListView.as_view(), name='order-history'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('<int:pk>/status/', OrderStatusUpdateView.as_view(), name='order-status'),
    path('', include(router.urls)),
]
