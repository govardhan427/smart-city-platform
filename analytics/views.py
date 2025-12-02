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
from rest_framework.permissions import IsAdminUser
from django.shortcuts import get_object_or_404
from events.models import Registration
from facilities.models import Booking
from transport.models import ParkingBooking
import csv
from django.http import HttpResponse

# Import models
from events.models import Event, Registration
from facilities.models import Facility, Booking
from transport.models import ParkingLot, ParkingBooking

User = get_user_model()

class DashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # --- 1. HEADLINE STATS ---
        total_users = User.objects.count()
        total_revenue = ParkingBooking.objects.count() * 5.00 # $5 per parking
        
        # --- 2. MOST POPULAR EVENTS (Pie Chart Data) ---
        # Get top 5 events by registration count
        popular_events = Event.objects.annotate(
            attendees=Count('registrations')
        ).order_by('-attendees')[:5]
        
        event_chart_data = [
            {"name": event.title[:15], "value": event.attendees} 
            for event in popular_events if event.attendees > 0
        ]

        # --- 3. FACILITY USAGE BY DAY OF WEEK (Bar Chart Data) ---
        # 1=Sunday, 2=Monday, ..., 7=Saturday
        facility_days = Booking.objects.annotate(
            weekday=ExtractWeekDay('booking_date')
        ).values('weekday').annotate(count=Count('id')).order_by('weekday')

        # Map numbers to names
        day_map = {1: 'Sun', 2: 'Mon', 3: 'Tue', 4: 'Wed', 5: 'Thu', 6: 'Fri', 7: 'Sat'}
        facility_chart_data = []
        
        # Helper to ensure we don't crash if data is empty
        for item in facility_days:
            if item['weekday'] in day_map:
                facility_chart_data.append({
                    "day": day_map[item['weekday']],
                    "bookings": item['count']
                })

        # --- 4. PARKING LOT OCCUPANCY (Heatmap/Bar Data) ---
        # Which lots have the most bookings?
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
                "revenue": total_revenue,
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