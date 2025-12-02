from django.shortcuts import render

# Create your views here.
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import ParkingLot, ParkingBooking
from .serializers import ParkingLotSerializer, ParkingBookingSerializer
from events.utils import generate_qr_code_bytes
from .utils import send_parking_email
from core.permissions import IsTransportManager
from rest_framework.permissions import IsAdminUser

class ParkingLotListView(generics.ListAPIView):
    queryset = ParkingLot.objects.all()
    serializer_class = ParkingLotSerializer
    permission_classes = [permissions.AllowAny]

class BookParkingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        lot = get_object_or_404(ParkingLot, pk=pk)
        
        # 1. CHECK CAPACITY
        if lot.is_full:
            return Response({"error": "Parking Lot is Full!"}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Prepare Data
        data = request.data.copy()
        data['parking_lot'] = lot.id
        
        serializer = ParkingBookingSerializer(data=data)
        if serializer.is_valid():
            # 3. Save Booking
            booking = serializer.save(user=request.user)
            
            # --- 4. GENERATE QR & SEND EMAIL ---
            try:
                # Generate QR (using booking ID)
                qr_bytes = generate_qr_code_bytes(f"parking:{booking.id}")
                
                # Send Email
                send_parking_email(
                    user_email=request.user.email,
                    parking_lot_name=lot.name,
                    booking=booking,
                    qr_code_bytes=qr_bytes
                )
            except Exception as e:
                # Don't fail the whole request just because email failed, but log it
                print(f"Email failed: {e}")
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MyParkingView(generics.ListAPIView):
    serializer_class = ParkingBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ParkingBooking.objects.filter(user=self.request.user).order_by('-created_at')

class ParkingLotCreateView(generics.CreateAPIView):
    """
    Allows Admins to create a new Parking Lot.
    """
    queryset = ParkingLot.objects.all()
    serializer_class = ParkingLotSerializer
    permission_classes = [IsAdminUser]