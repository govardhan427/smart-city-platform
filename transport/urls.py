# transport/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('parking/', views.ParkingLotListView.as_view(), name='parking-list'),
    
    # <-- CHANGE: int to uuid -->
    path('parking/<uuid:pk>/book/', views.BookParkingView.as_view(), name='parking-book'),
    
    path('my-parking/', views.MyParkingView.as_view(), name='my-parking'),
    path('parking/create/', views.ParkingLotCreateView.as_view(), name='parking-create'),
    path('feedback/', views.SubmitParkingFeedbackView.as_view(), name='submit-parking-feedback'),
]