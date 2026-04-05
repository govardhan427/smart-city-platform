from django.shortcuts import render, get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.db import transaction, IntegrityError # Import transaction handling
from .models import Facility, Booking, FacilityReview
from .serializers import FacilitySerializer, BookingSerializer
from .utils import send_booking_email, generate_qr_code_bytes
from django.utils import timezone

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
                # START TRANSACTION: Atomic block ensures "All or Nothing"
                with transaction.atomic():
                    # 1. Save the booking
                    booking = serializer.save(user=request.user)
                    
                    # 2. Generate QR Code
                    qr_bytes = generate_qr_code_bytes(f"facility:{booking.id}")
                    
                    # 3. Send Email
                    # If this fails, the transaction rolls back (undoes the booking)
                    try:
                        send_booking_email(
                            user_email=request.user.email, 
                            facility=facility,
                            booking=booking, 
                            qr_code_bytes=qr_bytes
                        )
                    except Exception as email_error:
                        # Raise exception to trigger the outer 'except' block and rollback
                        raise Exception(f"Email sending failed: {str(email_error)}")

                # If we get here, both DB and Email succeeded
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            except IntegrityError:
                # This catches database constraints (like unique_together for facility+date+slot)
                return Response(
                    {"error": "This time slot is already booked."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                # This catches the Email error (and the rollback happens automatically)
                print(f"Booking Failed: {e}")
                return Response(
                    {"error": f"Booking failed: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        # Serializer validation errors (e.g., missing date)
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

class SubmitFacilityReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, facility_id):
        user = request.user

        # 1. VERIFIED ATTENDEE CHECK
        if not Booking.objects.filter(user=user, facility_id=facility_id).exists():
            return Response({"error": "You can only review facilities you have booked."}, status=status.HTTP_403_FORBIDDEN)

        # 2. TIME BARRIER CHECK (Check if AT LEAST ONE booking is in the past)
        past_booking = Booking.objects.filter(user=user, facility_id=facility_id, booking_date__lt=timezone.now().date()).exists()
        if not past_booking:
            return Response({"error": "You cannot review a facility before your booking date."}, status=status.HTTP_400_BAD_REQUEST)

        # 3. SAVE REVIEW
        rating = request.data.get('rating')
        comment = request.data.get('comment', '')

        if not rating or int(rating) < 1 or int(rating) > 5:
            return Response({"error": "Valid rating between 1 and 5 is required."}, status=status.HTTP_400_BAD_REQUEST)

        FacilityReview.objects.update_or_create(
            user=user, facility_id=facility_id,
            defaults={'rating': rating, 'comment': comment}
        )
        return Response({"message": "Review submitted successfully!"}, status=status.HTTP_201_CREATED)