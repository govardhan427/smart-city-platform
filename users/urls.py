from django.urls import path
from .views import (
    UserRegisterView, 
    MyProfileView,
    MyTokenObtainPairView,
    CookieTokenRefreshView,
    LogoutView,
    ChangePasswordView, 
    UpdateProfileView,
    UserListView
)

urlpatterns = [
    # Auth & Tokens
    path('register/', UserRegisterView.as_view(), name='user-register'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),       # Login
    path('token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),  # Refresh (Cookie)
    path('logout/', LogoutView.as_view(), name='logout'),                            # Logout

    # Profile Management
    path('me/', MyProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('update-profile/', UpdateProfileView.as_view(), name='update-profile'),

    # Admin Only
    path('list/', UserListView.as_view(), name='user-list'),
]