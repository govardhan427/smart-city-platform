from django.urls import path
from .views import ParkingPredictProxy, EventRecommendationProxy, FacilityRecommendationProxy

urlpatterns = [
    # Parking Prediction
    path('transport/predict/', ParkingPredictProxy.as_view(), name='parking-predict'),

    # Recommendations
    path('recommendations/events/', EventRecommendationProxy.as_view(), name='event-recommendations'),
    path('recommendations/facilities/', FacilityRecommendationProxy.as_view(), name='facility-recommendations'),
]