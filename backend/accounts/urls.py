from django.urls import path
from .views import AccountBalanceView, deposit, withdraw, transfer

urlpatterns = [
    path('balance/', AccountBalanceView.as_view(), name='balance'),
    path('deposit/', deposit, name='deposit'),
    path('withdraw/', withdraw, name='withdraw'),
    path('transfer/', transfer, name='transfer'),
]
