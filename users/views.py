from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from .models import User
from .serializers import UserSerializer, UserRegisterSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import MyTokenObtainPairSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ChangePasswordSerializer, UserUpdateSerializer
from django.conf import settings

class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

class MyProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        # Generate the tokens
        response = super().post(request, *args, **kwargs)
        
        # Extract the refresh token
        refresh_token = response.data.get('refresh')

        if refresh_token:
            # Set the HttpOnly cookie
            response.set_cookie(
                key='refresh_token', 
                value=refresh_token,
                httponly=True,  # Crucial: JS cannot read this
                samesite='Lax', # Protects against CSRF
                secure=False,   # Set to True in Production (HTTPS only)
                max_age=7 * 24 * 60 * 60 # 7 days
            )
            # Optional: Remove refresh token from JSON response for extra security
            del response.data['refresh']
        
        return response

# 2. Custom Refresh View to read from Cookie
class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        # If the refresh token is in the cookie, inject it into the request data
        refresh_token = request.COOKIES.get('refresh_token')
        
        if refresh_token:
            request.data['refresh'] = refresh_token
            
        return super().post(request, *args, **kwargs)

# 3. Logout View to clear the cookie
class LogoutView(APIView):
    def post(self, request):
        response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        response.delete_cookie('refresh_token')
        return response

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.data.get("new_password"))
            user.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateProfileView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserUpdateSerializer
    
    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    """
    Returns a list of all registered users.
    Only accessible by Admins.
    """
    permission_classes = [IsAdminUser]
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer