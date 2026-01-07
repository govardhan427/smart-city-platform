from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .engine import get_event_recommendations, get_facility_recommendations
from events.serializers import EventSerializer 
from facilities.serializers import FacilitySerializer

class RecommendationView(APIView):
    """
    GET /api/recommendations/events/
    Returns 3 suggested events based on the user's last booking.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user_id = request.user.id
            
            # Call the ML Engine
            suggested_events = get_event_recommendations(user_id=user_id, top_n=3)
            
            # Serialize
            serializer = EventSerializer(suggested_events, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"ML Error: {e}")
            # Fallback: Return empty list or latest events if ML fails
            return Response([])

class FacilityRecommendationView(APIView):
    """
    GET /api/recommendations/facilities/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user_id = request.user.id
            recommended = get_facility_recommendations(user_id=user_id, top_n=3)
            
            serializer = FacilitySerializer(recommended, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"Facility ML Error: {e}")
            return Response([])