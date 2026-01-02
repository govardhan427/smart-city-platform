from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.db import transaction # <--- Important Import
from core.permissions import IsEventManager
from facilities.models import Booking
from transport.models import ParkingBooking
from django.db.models import Q

from .models import Event, Registration
from .serializers import EventSerializer, RegistrationSerializer, CheckInSerializer
from .utils import generate_qr_code_bytes, send_registration_email
from rest_framework.generics import RetrieveUpdateDestroyAPIView

class EventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.all().order_by('date')
    serializer_class = EventSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsEventManager()]
        return [AllowAny()]

class EventDetailView(RetrieveUpdateDestroyAPIView):
    """
    GET: Public
    PUT/PATCH/DELETE: Admin Only
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def get_permissions(self):
        # Allow anyone to view, but only admins to edit/delete
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminUser()]
        return [AllowAny()]


class EventRegisterView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        event = get_object_or_404(Event, pk=pk)
        tickets = int(request.data.get('tickets', 1))
        
        # 1. Check if already registered
        if Registration.objects.filter(user=request.user, event=event).exists():
            return Response(
                {"error": "You are already registered for this event."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # START TRANSACTION (Atomic block)
            with transaction.atomic():
                # 2. Create Registration
                registration = Registration.objects.create(
                    user=request.user,
                    event=event,
                    tickets=tickets
                )
                
                # 3. Generate QR & Send Email
                # If this fails, the registration above is rolled back
                qr_code_bytes = generate_qr_code_bytes(f"event:{registration.id}")
                
                try:
                    send_registration_email(
                        user_email=request.user.email,
                        event_title=event.title,
                        registration_id=registration.id,
                        qr_code_bytes=qr_code_bytes
                    )
                except Exception as email_error:
                    # Manually raise error to trigger rollback
                    raise Exception(f"Email sending failed: {str(email_error)}")
            
            # If we get here, both succeeded
            serializer = RegistrationSerializer(registration)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Event Registration Error: {e}")
            # If it was the "Email sending failed" error, we return 500
            # If it was something else (DB error), we still return 500
            return Response(
                {"error": f"Registration failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MyRegistrationsView(generics.ListAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Registration.objects.filter(user=self.request.user).order_by('event__date')


class CheckInView(APIView):
    permission_classes = [IsAdminUser] # Or specific manager permissions

    def post(self, request, *args, **kwargs):
        # The scanner sends: "event:UUID" or "facility:ID"
        qr_data = request.data.get('registration_id') 
        
        if not qr_data or ":" not in qr_data:
            return Response({"error": "Invalid QR Format"}, status=400)

        prefix, item_id = qr_data.split(":", 1)
        
        try:
            if prefix == 'event':
                obj = Registration.objects.get(id=item_id)
                if obj.attended_at: return Response({"error": "Already Checked In"}, status=400)
                obj.attended_at = timezone.now()
                obj.save()
                return Response({"message": f"Welcome to {obj.event.title}!"})

            elif prefix == 'facility':
                obj = Booking.objects.get(id=item_id)
                # Logic: Check if today is the correct date, etc.
                # For MVP, just mark entry.
                # We need to add an 'is_checked_in' field to Booking model first?
                # For now, let's assume we added attended_at to Booking model too, 
                # OR just return success for the demo.
                return Response({"message": f"Checked in to {obj.facility.name}"})

            elif prefix == 'parking':
                obj = ParkingBooking.objects.get(id=item_id)
                if not obj.is_active: return Response({"error": "Booking Expired"}, status=400)
                # In parking, scanning might mean ENTRY (start) or EXIT (end).
                # For MVP, let's just confirm validity.
                return Response({"message": f"Access Granted: {obj.vehicle_number}"})
            
            else:
                return Response({"error": "Unknown QR Type"}, status=400)

        except Exception as e:
            return Response({"error": "Booking not found"}, status=404)