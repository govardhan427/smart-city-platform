from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
# --- FIX: Import AllowAny ---
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser 
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.conf import settings
from .models import User
from .serializers import (
    UserSerializer, 
    UserRegisterSerializer, 
    MyTokenObtainPairSerializer, 
    ChangePasswordSerializer, 
    UserUpdateSerializer
)

# --- 1. REGISTER ---
class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

# --- 2. PROFILE ---
class MyProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

# --- 3. LOGIN (Sets Secure Cookie) ---
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            refresh_token = response.data.get('refresh')

            if refresh_token:
                response.set_cookie(
                    key='refresh_token', 
                    value=refresh_token,
                    httponly=True,
                    samesite='None',  
                    secure=True,      
                    max_age=7 * 24 * 60 * 60 
                )
                if 'refresh' in response.data:
                    del response.data['refresh']
            
            return response
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# --- 4. REFRESH (Reads Secure Cookie) ---
class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')

        if not refresh_token:
            return Response(
                {"detail": "Authentication Cookie Missing. Please login again."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        data = request.data.copy()
        data['refresh'] = refresh_token
        
        serializer = self.get_serializer(data=data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.validated_data, status=status.HTTP_200_OK)

# --- 5. LOGOUT (The Fix) ---
class LogoutView(APIView):
    permission_classes = [AllowAny] 
    authentication_classes = [] 

    def post(self, request):
        response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        
        # Manually overwrite the cookie to force deletion
        response.set_cookie(
            key='refresh_token',
            value='',             # Empty value
            max_age=0,            # Expire immediately
            expires='Thu, 01 Jan 1970 00:00:00 GMT', # Safety net for older browsers
            httponly=True,
            samesite='None',      # MUST match the login cookie
            secure=True           # MUST match the login cookie
        )
        return response

# --- 6. CHANGE PASSWORD ---
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

# --- 7. UPDATE PROFILE ---
class UpdateProfileView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserUpdateSerializer
    
    def get_object(self):
        return self.request.user

# --- 8. ADMIN USER LIST ---
class UserListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer