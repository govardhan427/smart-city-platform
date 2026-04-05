# facilities/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # /api/facilities/
    path('', views.FacilityListView.as_view(), name='facility-list'),
    
    # <-- CHANGE: int to uuid -->
    path('<uuid:pk>/book/', views.BookingCreateView.as_view(), name='facility-book'),
    path('<uuid:pk>/', views.FacilityDetailView.as_view(), name='facility-detail'),
    path('<uuid:facility_id>/review/', views.SubmitFacilityReviewView.as_view(), name='submit-facility-review'),
    
    # /api/facilities/my-bookings/
    path('my-bookings/', views.MyBookingsView.as_view(), name='my-facility-bookings'),
    path('create/', views.FacilityCreateView.as_view(), name='facility-create'),
]