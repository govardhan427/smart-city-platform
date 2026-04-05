from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
# --- THESE ARE THE MISSING IMPORTS ---
from django.db.models import Count 
from django.db.models.functions import ExtractWeekDay
from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from django.shortcuts import get_object_or_404
from events.models import Registration
from facilities.models import Booking
from transport.models import ParkingBooking
import csv
from django.http import HttpResponse
from .models import Announcement
from .serializers import AnnouncementSerializer
from rest_framework import generics
from itertools import chain
from operator import attrgetter
from django.db.models import Sum, F, Count
from django.db.models.functions import Coalesce
from django.utils import timezone
from django.core.cache import cache

# Import models
from events.models import Event, Registration
from facilities.models import Facility, Booking
from transport.models import ParkingLot, ParkingBooking
import os
from django.conf import settings
from django.db import models  # <--- Add this line
from groq import Groq

User = get_user_model()

class DashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # --- 1. HEADLINE STATS ---
        
        # A. Total Registered Users (Citizens)
        total_users = User.objects.count()

        # B. Calculate REAL Total Revenue (Summing actual database values)
        
        # 1. Event Revenue: Sum(tickets * event_price)
        event_revenue = Registration.objects.aggregate(
            total=Coalesce(Sum(F('tickets') * F('event__price')), 0.00, output_field=models.DecimalField())
        )['total']

        # 2. Facility Revenue: Sum(facility_price)
        facility_revenue = Booking.objects.aggregate(
            total=Coalesce(Sum('facility__price'), 0.00, output_field=models.DecimalField())
        )['total']

        # 3. Parking Revenue: Sum(rate_per_hour) 
        # (Note: Since we don't store duration in DB yet, we assume 1 hour fee per booking for now)
        parking_revenue = ParkingBooking.objects.aggregate(
            total=Coalesce(Sum('parking_lot__rate_per_hour'), 0.00, output_field=models.DecimalField())
        )['total']

        # GRAND TOTAL
        total_revenue = float(event_revenue) + float(facility_revenue) + float(parking_revenue)
        
        # --- 2. MOST POPULAR EVENTS (Pie Chart Data) ---
        popular_events = Event.objects.annotate(
            attendees=Count('registrations')
        ).order_by('-attendees')[:5]
        
        event_chart_data = [
            {"name": event.title[:15], "value": event.attendees} 
            for event in popular_events if event.attendees > 0
        ]

        # --- 3. FACILITY USAGE BY DAY OF WEEK (Bar Chart Data) ---
        facility_days = Booking.objects.annotate(
            weekday=ExtractWeekDay('booking_date')
        ).values('weekday').annotate(count=Count('id')).order_by('weekday')

        day_map = {1: 'Sun', 2: 'Mon', 3: 'Tue', 4: 'Wed', 5: 'Thu', 6: 'Fri', 7: 'Sat'}
        facility_chart_data = []
        
        for item in facility_days:
            if item['weekday'] in day_map:
                facility_chart_data.append({
                    "day": day_map[item['weekday']],
                    "bookings": item['count']
                })

        # --- 4. PARKING LOT OCCUPANCY ---
        busy_parking = ParkingLot.objects.annotate(
            usage=Count('bookings')
        ).order_by('-usage')

        parking_chart_data = [
            {"name": lot.name, "usage": lot.usage}
            for lot in busy_parking
        ]

        # --- 5. BUSIEST FACILITY TIMES ---
        busy_times = Booking.objects.values('time_slot').annotate(
            count=Count('id')
        ).order_by('-count')[:3]

        busiest_hour_text = busy_times[0]['time_slot'] if busy_times else "N/A"

        return Response({
            "counts": {
                "users": total_users,
                "revenue": total_revenue, # Now sends raw number (e.g., 5500.00)
                "busiest_hour": busiest_hour_text
            },
            "charts": {
                "events": event_chart_data,
                "facilities": facility_chart_data,
                "parking": parking_chart_data
            }
        })

class LiveOccupancyView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # 1. EVENTS: Capacity vs Registered vs Checked-In
        events_data = Event.objects.annotate(
            registered=Count('registrations'),
            checked_in=Count('registrations', filter=Q(registrations__attended_at__isnull=False))
        ).values('id','title', 'location', 'registered', 'checked_in')

        # 2. FACILITIES: Capacity vs Booked Today
        facilities_data = Facility.objects.annotate(
            booked_count=Count('bookings') # In real app, filter by today
        ).values('id','name', 'capacity', 'booked_count')

        # 3. PARKING: Capacity vs Active
        parking_data = ParkingLot.objects.all()
        parking_list = []
        for lot in parking_data:
            parking_list.append({
                "id": lot.id,
                "name": lot.name,
                "capacity": lot.total_capacity,
                "occupied": lot.available_spaces # Calculated property from model
            })

        return Response({
            "events": list(events_data),
            "facilities": list(facilities_data),
            "parking": parking_list
        })

class RosterDetailView(APIView):
    """
    Returns a list of attendees/bookings for a specific item.
    URL: /api/analytics/roster/<str:type>/<int:pk>/
    """
    permission_classes = [IsAdminUser]

    def get(self, request, item_type, pk):
        data = []

        if item_type == 'event':
            # Get all registrations for this event
            regs = Registration.objects.filter(event_id=pk).select_related('user')
            for r in regs:
                data.append({
                    "user": r.user.email,
                    "status": "Checked In" if r.attended_at else "Pending",
                    "time": r.attended_at if r.attended_at else "—",
                    "id": r.id
                })

        elif item_type == 'facility':
            # Get all bookings for this facility
            bookings = Booking.objects.filter(facility_id=pk).select_related('user').order_by('-booking_date')
            for b in bookings:
                data.append({
                    "user": b.user.email,
                    "status": f"{b.booking_date} | {b.time_slot}", # Facilities are time-based
                    "time": "Booked", 
                    "id": b.id
                })

        elif item_type == 'parking':
            # Get active bookings for this lot
            bookings = ParkingBooking.objects.filter(parking_lot_id=pk).select_related('user').order_by('-start_time')
            for b in bookings:
                data.append({
                    "user": b.user.email,
                    "status": "Active" if b.is_active else "Completed",
                    "time": b.start_time, # When they parked
                    "extra": b.vehicle_number, # Show vehicle plate
                    "id": b.id
                })

        return Response(data)
class ExportRosterCSV(APIView):
    """
    Downloads a CSV file of attendees for a specific item.
    """
    permission_classes = [IsAdminUser]

    def get(self, request, item_type, pk):
        # Create the HttpResponse object with the appropriate CSV header.
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{item_type}_{pk}_roster.csv"'

        writer = csv.writer(response)

        if item_type == 'event':
            writer.writerow(['Registration ID', 'User Email', 'Tickets', 'Status', 'Check-In Time'])
            regs = Registration.objects.filter(event_id=pk).select_related('user')
            for r in regs:
                status = "Checked In" if r.attended_at else "Pending"
                writer.writerow([r.id, r.user.email, r.tickets, status, r.attended_at])

        elif item_type == 'facility':
            writer.writerow(['Booking ID', 'User Email', 'Date', 'Time Slot'])
            bookings = Booking.objects.filter(facility_id=pk).select_related('user')
            for b in bookings:
                writer.writerow([b.id, b.user.email, b.booking_date, b.time_slot])

        elif item_type == 'parking':
            writer.writerow(['Booking ID', 'User Email', 'Vehicle Number', 'Start Time', 'Status'])
            bookings = ParkingBooking.objects.filter(parking_lot_id=pk).select_related('user')
            for b in bookings:
                status = "Active" if b.is_active else "Completed"
                writer.writerow([b.id, b.user.email, b.vehicle_number, b.start_time, status])

        return response

class ExportFinancialsCSV(APIView):
    """
    Downloads a report of all revenue-generating activities.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="smart_city_financials.csv"'
        writer = csv.writer(response)
        
        writer.writerow(['Type', 'Item Name', 'User', 'Date', 'Amount (Estimated)'])

        # 1. Event Revenue
        paid_regs = Registration.objects.filter(event__price__gt=0).select_related('event', 'user')
        for r in paid_regs:
            amount = r.tickets * r.event.price
            writer.writerow(['Event', r.event.title, r.user.email, r.registered_at.date(), amount])

        # 2. Parking Revenue (Assuming 1 hour avg for simplicity or using rate)
        # In a real app, you'd calculate (end_time - start_time) * rate
        parking_bookings = ParkingBooking.objects.select_related('parking_lot', 'user')
        for p in parking_bookings:
            amount = p.parking_lot.rate_per_hour # Flat rate logic for MVP
            writer.writerow(['Parking', p.parking_lot.name, p.user.email, p.created_at.date(), amount])

        # 3. Facility Revenue (If you added price to facilities)
        facility_bookings = Booking.objects.filter(facility__price__gt=0).select_related('facility', 'user')
        for f in facility_bookings:
             writer.writerow(['Facility', f.facility.name, f.user.email, f.booking_date, f.facility.price])

        return response

class CityBotAIView(APIView):
    """
    Advanced AI City Assistant - Elite Concierge with Memory
    """
    permission_classes = [AllowAny] 

    def post(self, request):
        user_message = request.data.get('message', '')
        
        # --- THE FIX IS HERE (.strip() instead of .trim()) ---
        if not user_message.strip():
            return Response({"response": "How can I help you today?"})
        
        # --- 1. IDENTITY & MEMORY SETUP ---
        if request.user.is_authenticated:
            user_identity = request.user.username or request.user.email.split('@')[0]
            cache_key = f"citybot_memory_user_{request.user.id}"
        else:
            user_identity = "Guest"
            # Fallback to IP address for guest memory
            ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', 'guest'))
            cache_key = f"citybot_memory_ip_{ip}"

        # Retrieve the last few messages (short-term memory)
        chat_history = cache.get(cache_key, [])
        chat_history.append({"role": "user", "content": user_message})
        
        # Keep only the last 6 messages to prevent token limits and keep the bot focused
        chat_history = chat_history[-6:]

        # --- 2. GATHER REAL-TIME DATA ---
        total_users = User.objects.count()
        
        upcoming_events = Event.objects.filter(date__gte=timezone.now()).order_by('date')[:5]
        events_context = "\n".join([f"- **{e.title}** (Date: {e.date}, Location: {e.location}, Price: ₹{e.price})" for e in upcoming_events]) if upcoming_events else "No upcoming events."

        parking_lots = ParkingLot.objects.all()[:5]
        parking_context = "\n".join([f"- **{p.name}** (Available: {p.available_spaces}/{p.total_capacity}, Rate: ₹{p.rate_per_hour}/hr)" for p in parking_lots]) if parking_lots else "No parking data."

        facilities = Facility.objects.all()[:5]
        facility_context = "\n".join([f"- **{f.name}** (Location: {f.location}, Capacity: {f.capacity})" for f in facilities]) if facilities else "No facilities available."

        # --- 3. THE ELITE SYSTEM PROMPT ---
        system_context = f"""
        You are CityBot — an elite, hyper-intelligent AI concierge for the Smart Access Hub in Tirupati, India.
        You are speaking to: {user_identity}.

        === PERSONALITY & TONE ===
        - Speak like a smart, calm, premium human assistant. Never sound like a robot reading a script.
        - Be warm, concise, and highly effective.
        - If the user is confused, simplify. If they are returning, acknowledge it smoothly.

        === CORE RULES (STRICT COMPLIANCE) ===
        1. NEVER dump raw data. Do not list events, parking, or facilities unless explicitly asked.
        2. Keep answers short (1–3 sentences normally). 
        3. SYNTHESIZE: If asked about events, say "We have a few events coming up, like the Youth Festival. Want me to show you the highlights?" instead of listing all of them at once.
        4. MEMORY: You remember the last few messages in this conversation. Do not repeat yourself.

        === LIVE CITY INTELLIGENCE ===
        (Only use this data to answer specific questions)
        • Total Citizens: {total_users}
        • Events:
        {events_context}
        • Parking:
        {parking_context}
        • Facilities: 
        {facility_context}

        === ACTION LINKS ===
        If the user wants to take action, provide the exact Markdown link:
        - Events → [View Events](/events)
        - Parking → [Find Parking](/parking)
        - Facilities → [Browse Facilities](/facilities)
        - Bookings → [View Profile](/profile)
        """

        # Build the final message array: System prompt + History
        messages = [{"role": "system", "content": system_context}] + chat_history

        # --- 4. CALL GROQ API ---
        try:
            api_key = os.environ.get('GROQ_API_KEY')
            if not api_key:
                return Response({"response": "System Error: Missing API Key."}, status=500)

            client = Groq(api_key=api_key)
            
            chat_completion = client.chat.completions.create(
                messages=messages,
                model="llama-3.1-8b-instant", 
                temperature=0.6, # 0.6 is the sweet spot for natural but factual conversation
                max_tokens=200,  # Strict limit to prevent long essays
            )
            
            ai_response = chat_completion.choices[0].message.content

            # --- 5. SAVE ASSISTANT RESPONSE TO MEMORY ---
            chat_history.append({"role": "assistant", "content": ai_response})
            # Save to Django cache for 1 hour (3600 seconds)
            cache.set(cache_key, chat_history, timeout=3600)

            return Response({"response": ai_response})

        except Exception as e:
            print(f"Groq AI Error: {e}")
            return Response({"response": "I'm having a little trouble connecting to the network right now. Give me just a second and try again!"}, status=500)

class AnnouncementView(APIView):
    """
    GET: Returns the latest active announcement.
    POST: Creates a new announcement (Admin only).
    """
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()] # Lock POST to Admins
        return [AllowAny()]        # Open GET to Everyone
    def get(self, request):
        # Get the newest active message
        announcement = Announcement.objects.filter(is_active=True).order_by('-created_at').first()
        if announcement:
            return Response({"message": announcement.message})
        return Response({"message": None})

    def post(self, request):
        serializer = AnnouncementSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class RevenueListView(APIView):
    """
    Aggregates financial data from Events, Facilities, and Parking.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        data = []

        # 1. Event Revenue
        paid_regs = Registration.objects.filter(event__price__gt=0).select_related('event')[:20]
        for r in paid_regs:
            data.append({
                "id": f"evt_{r.id}",
                "description": r.event.title,
                "category": "Event Ticket",
                "source": "Events",
                "amount": r.tickets * r.event.price,
                "date": r.registered_at
            })

        # 2. Facility Revenue
        paid_bookings = Booking.objects.filter(facility__price__gt=0).select_related('facility')[:20]
        for b in paid_bookings:
            data.append({
                "id": f"fac_{b.id}",
                "description": b.facility.name,
                "category": "Facility Booking",
                "source": "Facilities",
                "amount": b.facility.price,
                "date": b.created_at
            })

        # 3. Parking Revenue
        parking_bookings = ParkingBooking.objects.all().select_related('parking_lot')[:20]
        for p in parking_bookings:
            data.append({
                "id": f"park_{p.id}",
                "description": p.parking_lot.name,
                "category": "Parking Fee",
                "source": "Transport",
                "amount": p.parking_lot.rate_per_hour, # Simplified logic
                "date": p.created_at
            })

        # Sort by most recent
        data.sort(key=lambda x: x['date'], reverse=True)
        return Response(data[:50]) # Return top 50 transactions


class ActivityListView(APIView):
    """
    Aggregates recent system actions into a single timeline.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        data = []

        # 1. New User Registrations
        users = User.objects.all().order_by('-date_joined')[:10]
        for u in users:
            data.append({
                "id": f"user_{u.id}",
                "action": "New User Registration",
                "username": u.username,
                "timestamp": u.date_joined
            })

        # 2. Event Registrations
        regs = Registration.objects.all().select_related('user', 'event').order_by('-registered_at')[:10]
        for r in regs:
            data.append({
                "id": f"reg_{r.id}",
                "action": f"Registered for {r.event.title[:20]}...",
                "username": r.user.username,
                "timestamp": r.registered_at
            })

        # 3. Parking Reservations
        parks = ParkingBooking.objects.all().select_related('user', 'parking_lot').order_by('-created_at')[:10]
        for p in parks:
            data.append({
                "id": f"park_{p.id}",
                "action": f"Reserved {p.parking_lot.name}",
                "username": p.user.username,
                "timestamp": p.created_at
            })

        # Sort combined list by timestamp descending
        data.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return Response(data[:50])