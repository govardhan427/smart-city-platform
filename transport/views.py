from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from django.db import transaction # <--- Important Import
from .models import ParkingLot, ParkingBooking
from .serializers import ParkingLotSerializer, ParkingBookingSerializer
from events.utils import generate_qr_code_bytes
from .utils import send_parking_email

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
            try:
                # START TRANSACTION (All or Nothing)
                with transaction.atomic():
                    # 3. Save Booking
                    booking = serializer.save(user=request.user)
                    
                    # 4. Generate QR & Send Email
                    # If this block fails, the booking above is undone
                    qr_bytes = generate_qr_code_bytes(f"parking:{booking.id}")
                    
                    try:
                        send_parking_email(
                            user_email=request.user.email,
                            parking_lot_name=lot.name,
                            booking=booking,
                            qr_code_bytes=qr_bytes
                        )
                    except Exception as email_error:
                        # Raise error to trigger rollback
                        raise Exception(f"Email sending failed: {str(email_error)}")
            
                # Both succeeded
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            except Exception as e:
                print(f"Parking Booking Failed: {e}")
                return Response(
                    {"error": f"Booking failed: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
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