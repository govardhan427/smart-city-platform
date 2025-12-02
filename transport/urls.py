from django.urls import path
from . import views

urlpatterns = [
    path('parking/', views.ParkingLotListView.as_view(), name='parking-list'),
    path('parking/<int:pk>/book/', views.BookParkingView.as_view(), name='parking-book'),
    path('my-parking/', views.MyParkingView.as_view(), name='my-parking'),
    path('parking/create/', views.ParkingLotCreateView.as_view(), name='parking-create'),
]