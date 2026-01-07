import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from events.models import Event, Registration
from facilities.models import Facility, Booking 

# --- CONFIGURATION ---
# Your ML Service running on Render
ML_SERVER_URL = "https://smart-city-ml.onrender.com" 

class ParkingPredictProxy(APIView):
    """
    POST /api/transport/predict/
    Proxies the request to the Render ML Service.
    """
    permission_classes = [AllowAny] 

    def post(self, request):
        try:
            # 1. Forward data to Render
            payload = {"datetime": request.data.get("datetime")}
            
            # Timeout added (10s) to prevent hanging if Render is waking up from sleep
            response = requests.post(f"{ML_SERVER_URL}/predict/parking/", json=payload, timeout=10)
            
            # 2. Return Render's response back to React
            if response.status_code == 200:
                return Response(response.json())
            else:
                return Response({"error": "ML Service Error"}, status=response.status_code)
        except requests.exceptions.Timeout:
            return Response({"error": "ML Service is waking up. Please try again in 10 seconds."}, status=503)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class EventRecommendationProxy(APIView):
    """
    GET /api/recommendations/events/
    Fetches user history, prepares candidate list, and asks Render for the best match.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # 1. Get User History (Last Event Registered)
        last_reg = Registration.objects.filter(user=user).order_by('-registered_at').first()
        
        # --- Cold Start: If no history, return latest 3 events ---
        if not last_reg:
            events = Event.objects.order_by('-created_at')[:3]
            data = [{
                "id": e.id, 
                "title": e.title, 
                "date": e.date, 
                "location": e.location, 
                "description": e.description
            } for e in events]
            return Response(data)

        # 2. Prepare Target Content (What user liked)
        target_content = f"{last_reg.event.title} {last_reg.event.description} {last_reg.event.location}"

        # 3. Prepare Candidates (All OTHER events)
        all_events = Event.objects.exclude(id=last_reg.event.id)
        candidates = []
        event_map = {}
        
        for e in all_events:
            content = f"{e.title} {e.description} {e.location}"
            candidates.append({"id": e.id, "content": content})
            event_map[e.id] = e

        if not candidates:
             return Response([])

        # 4. Ask Render ML Service for IDs
        try:
            payload = {
                "target_content": target_content,
                "candidates": candidates
            }
            # Send to ML Server
            response = requests.post(f"{ML_SERVER_URL}/recommend/", json=payload, timeout=5)
            
            if response.status_code == 200:
                recommended_ids = response.json()
                
                # 5. Fetch actual objects from Django DB preserving order
                final_events = []
                for rid in recommended_ids:
                    if rid in event_map:
                        final_events.append(event_map[rid])
                
                # Serialize manually
                data = [{
                    "id": e.id, 
                    "title": e.title, 
                    "date": e.date, 
                    "location": e.location, 
                    "description": e.description
                } for e in final_events]
                
                return Response(data)
            
            return Response([]) # Fail silently if ML errors
            
        except Exception as e:
            print(f"Event Proxy Error: {e}")
            # Fallback: Return latest events if ML fails
            events = Event.objects.order_by('-created_at')[:3]
            data = [{"id": e.id, "title": e.title, "description": e.description} for e in events]
            return Response(data)


class FacilityRecommendationProxy(APIView):
    """
    GET /api/recommendations/facilities/
    Fetches user booking history, prepares candidate list, and asks Render for the best match.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # 1. Get User History (Last Facility Booked)
        last_booking = Booking.objects.filter(user=user).order_by('-created_at').first()
        
        # --- Cold Start: If no bookings, return first 3 facilities ---
        if not last_booking:
            facilities = Facility.objects.all()[:3]
            data = [{
                "id": f.id, 
                "name": f.name, 
                "location": f.location, 
                "description": f.description,
                "capacity": f.capacity
            } for f in facilities]
            return Response(data)

        # 2. Prepare Target Content
        target_content = f"{last_booking.facility.name} {last_booking.facility.description} {last_booking.facility.location}"

        # 3. Prepare Candidates (All OTHER facilities)
        all_facilities = Facility.objects.exclude(id=last_booking.facility.id)
        candidates = []
        fac_map = {}
        
        for f in all_facilities:
            content = f"{f.name} {f.description} {f.location}"
            candidates.append({"id": f.id, "content": content})
            fac_map[f.id] = f

        if not candidates:
            return Response([])

        # 4. Ask Render ML Service for IDs
        try:
            payload = {
                "target_content": target_content,
                "candidates": candidates
            }
            
            # Send to ML Server (Reusing the same generic /recommend/ endpoint)
            response = requests.post(f"{ML_SERVER_URL}/recommend/", json=payload, timeout=5)
            
            if response.status_code == 200:
                recommended_ids = response.json()
                
                # 5. Fetch actual objects
                final_facilities = []
                for rid in recommended_ids:
                    if rid in fac_map:
                        final_facilities.append(fac_map[rid])
                
                # Serialize manually
                data = [{
                    "id": f.id, 
                    "name": f.name, 
                    "location": f.location, 
                    "description": f.description,
                    "capacity": f.capacity
                } for f in final_facilities]
                
                return Response(data)
            
            return Response([]) 
            
        except Exception as e:
            print(f"Facility Proxy Error: {e}")
            # Fallback
            facilities = Facility.objects.all()[:3]
            data = [{"id": f.id, "name": f.name, "description": f.description} for f in facilities]
            return Response(data)