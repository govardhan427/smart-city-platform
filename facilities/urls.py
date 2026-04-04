from django.urls import path
from . import views

urlpatterns = [
    # /api/facilities/
    path('', views.FacilityListView.as_view(), name='facility-list'),
    
    # /api/facilities/<id>/book/
    path('<int:pk>/book/', views.BookingCreateView.as_view(), name='facility-book'),
    path('<int:pk>/', views.FacilityDetailView.as_view(), name='facility-detail'),
    # /api/facilities/my-bookings/
    path('my-bookings/', views.MyBookingsView.as_view(), name='my-facility-bookings'),
    # Add this to your urlpatterns
    path('<int:facility_id>/review/', views.SubmitFacilityReviewView.as_view(), name='submit-facility-review'),
    path('create/', views.FacilityCreateView.as_view(), name='facility-create'),
]