from django.urls import path
from .views import (UserRegisterView, MyProfileView,MyTokenObtainPairView,ChangePasswordView, UpdateProfileView)
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    path('register/', UserRegisterView.as_view(), name='user-register'),
    path('me/', MyProfileView.as_view(), name='user-profile'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('update-profile/', UpdateProfileView.as_view(), name='update-profile'),
]