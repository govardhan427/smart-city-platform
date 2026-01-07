from django.urls import path
from .views import ParkingPredictView

urlpatterns = [
    path('predict/', ParkingPredictView.as_view(), name='parking-predict'),
]