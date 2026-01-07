from django.urls import path
from .views import RecommendationView, FacilityRecommendationView

urlpatterns = [
    path('events/', RecommendationView.as_view(), name='event-recommendations'),
    path('facilities/', FacilityRecommendationView.as_view(), name='facility-recommendations'),
]