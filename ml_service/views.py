import requests
from collections import Counter
from django.db.models import Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from events.models import Event, Registration
from facilities.models import Facility, Booking 

ML_SERVER_URL = "https://smart-city-ml.onrender.com"

class ParkingPredictProxy(APIView):
    permission_classes = [AllowAny] 
    def post(self, request):
        try:
            payload = {"datetime": request.data.get("datetime")}
            response = requests.post(f"{ML_SERVER_URL}/predict/parking/", json=payload, timeout=10)
            if response.status_code == 200:
                return Response(response.json())
            return Response({"error": "ML Service Error"}, status=response.status_code)
        except requests.exceptions.Timeout:
            return Response({"error": "ML Service is waking up. Please try again in 10 seconds."}, status=503)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class EventRecommendationProxy(APIView):
    """
    UPGRADED: Netflix-style Taste Profile + Location Anchor + Trending Cold Start
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # 1. Grab the last 5 bookings to build a "Taste Profile"
        recent_regs = Registration.objects.filter(user=user).select_related('event').order_by('-registered_at')[:5]
        
        # --- COLD START FIX: Trending Events ---
        if not recent_regs:
            # FIX: Changed 'registration' to 'registrations'
            trending_events = Event.objects.annotate(reg_count=Count('registrations')).order_by('-reg_count')[:3]
            
            # If database is completely empty of registrations, fallback to latest
            if not trending_events:
                trending_events = Event.objects.order_by('-created_at')[:3]
                
            data = [{
                "id": e.id, "title": e.title, "date": e.date, 
                "location": e.location, "description": e.description
            } for e in trending_events]
            return Response(data)

        # 2. Build the Taste Profile & Find the "Anchor Location"
        taste_texts = []
        locations = []
        
        for reg in recent_regs:
            # Combine all the text from what they liked
            taste_texts.append(f"{reg.event.title} {reg.event.description}")
            if reg.event.location:
                # We split by comma and take the city name to find their main hub
                city = reg.event.location.split(',')[0].strip()
                locations.append(city)

        target_content = " ".join(taste_texts)
        
        # Determine the user's most frequented city
        target_location = Counter(locations).most_common(1)[0][0] if locations else ""

        # 3. Prepare Candidates (All other events)
        # We exclude ALL events the user has already booked, not just the last one
        booked_event_ids = [reg.event.id for reg in recent_regs]
        all_events = Event.objects.exclude(id__in=booked_event_ids)
        
        candidates = []
        event_map = {}
        for e in all_events:
            content = f"{e.title} {e.description}"
            # Notice we are now sending the location of the candidate to the ML server!
            candidates.append({"id": e.id, "content": content, "location": e.location or ""})
            event_map[e.id] = e

        if not candidates:
             return Response([])

        # 4. Ask Render ML Service
        try:
            payload = {
                "target_content": target_content,
                "target_location": target_location, # NEW: Send Anchor Location
                "candidates": candidates
            }
            response = requests.post(f"{ML_SERVER_URL}/recommend/", json=payload, timeout=5)
            
            if response.status_code == 200:
                recommended_ids = response.json()
                final_events = [event_map[rid] for rid in recommended_ids if rid in event_map]
                
                data = [{
                    "id": e.id, "title": e.title, "date": e.date, 
                    "location": e.location, "description": e.description
                } for e in final_events]
                return Response(data)
            
            return Response([]) 
            
        except Exception as e:
            print(f"Event Proxy Error: {e}")
            # FIX: Changed 'registration' to 'registrations'
            fallback = Event.objects.annotate(reg_count=Count('registrations')).order_by('-reg_count')[:3]
            data = [{"id": e.id, "title": e.title, "description": e.description} for e in fallback]
            return Response(data)


class FacilityRecommendationProxy(APIView):
    """
    UPGRADED: Facility Taste Profile + Trending Cold Start
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        recent_bookings = Booking.objects.filter(user=user).select_related('facility').order_by('-created_at')[:5]
        
        # --- COLD START FIX ---
        if not recent_bookings:
            # FIX: Changed 'booking' to 'bookings'
            trending_facs = Facility.objects.annotate(book_count=Count('bookings')).order_by('-book_count')[:3]
            if not trending_facs:
                trending_facs = Facility.objects.all()[:3]
                
            data = [{
                "id": f.id, "name": f.name, "location": f.location, 
                "description": f.description, "capacity": f.capacity
            } for f in trending_facs]
            return Response(data)

        taste_texts = []
        locations = []
        for b in recent_bookings:
            taste_texts.append(f"{b.facility.name} {b.facility.description}")
            if b.facility.location:
                city = b.facility.location.split(',')[0].strip()
                locations.append(city)

        target_content = " ".join(taste_texts)
        target_location = Counter(locations).most_common(1)[0][0] if locations else ""

        booked_fac_ids = [b.facility.id for b in recent_bookings]
        all_facilities = Facility.objects.exclude(id__in=booked_fac_ids)
        
        candidates = []
        fac_map = {}
        for f in all_facilities:
            content = f"{f.name} {f.description}"
            candidates.append({"id": f.id, "content": content, "location": f.location or ""})
            fac_map[f.id] = f

        if not candidates:
            return Response([])

        try:
            payload = {
                "target_content": target_content,
                "target_location": target_location,
                "candidates": candidates
            }
            response = requests.post(f"{ML_SERVER_URL}/recommend/", json=payload, timeout=5)
            
            if response.status_code == 200:
                recommended_ids = response.json()
                final_facs = [fac_map[rid] for rid in recommended_ids if rid in fac_map]
                
                data = [{
                    "id": f.id, "name": f.name, "location": f.location, 
                    "description": f.description, "capacity": f.capacity
                } for f in final_facs]
                return Response(data)
            
            return Response([]) 
            
        except Exception as e:
            print(f"Facility Proxy Error: {e}")
            # FIX: Changed 'booking' to 'bookings'
            fallback = Facility.objects.annotate(book_count=Count('bookings')).order_by('-book_count')[:3]
            data = [{"id": f.id, "name": f.name, "description": f.description} for f in fallback]
            return Response(data)