from django.urls import path
from .views import RegisterView, ProfileView, CustomTokenObtainPairView, PublicBankInfoView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Public endpoints (no login required)
    path('bank-info/', PublicBankInfoView.as_view(), name='bank-info'),
    
    # Authentication endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Protected endpoints
    path('profile/', ProfileView.as_view(), name='profile'),
]
