from django.shortcuts import render

# Create your views here.
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Facility, Booking
from .serializers import FacilitySerializer, BookingSerializer
from .utils import send_booking_email, generate_qr_code_bytes
from rest_framework.permissions import IsAdminUser

# 1. List all Facilities (Public)
class FacilityListView(generics.ListAPIView):
    """
    Returns a list of all available facilities.
    """
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    permission_classes = [permissions.AllowAny]

# 2. Book a Facility (Authenticated User)
class BookingCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        facility = get_object_or_404(Facility, pk=pk)
        
        data = request.data.copy()
        data['facility'] = facility.id
        
        serializer = BookingSerializer(data=data)
        if serializer.is_valid():
            try:
                # 1. Save the booking
                booking = serializer.save(user=request.user)
                
                # 2. Generate QR Code (Using the Booking ID)
                # We cast ID to str because QR generator expects a string
                qr_bytes = generate_qr_code_bytes(f"facility:{booking.id}")
                
                # 3. Send Email
                send_booking_email(
                    user_email=request.user.email, 
                    facility_name=facility.name, 
                    booking=booking, 
                    qr_code_bytes=qr_bytes
                )

                return Response(serializer.data, status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response(
                    {"error": "This time slot is already booked for this date."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# 3. My Bookings (Authenticated User)
class MyBookingsView(generics.ListAPIView):
    """
    Returns all bookings made by the current user.
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).order_by('-booking_date')

class FacilityDetailView(generics.RetrieveAPIView):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    permission_classes = [permissions.AllowAny]

class FacilityCreateView(generics.CreateAPIView):
    """
    Allows Admins to create a new Facility.
    """
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    permission_classes = [IsAdminUser]