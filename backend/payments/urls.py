from django.urls import path
from .views import CreateRazorpayOrderView, VerifyPaymentView, SalesDashboardView

urlpatterns = [
    path('create-order/', CreateRazorpayOrderView.as_view(), name='create-payment-order'),
    path('verify/', VerifyPaymentView.as_view(), name='verify-payment'),
    path('dashboard/', SalesDashboardView.as_view(), name='sales-dashboard'),
]
