from django.urls import path
from . import views

urlpatterns = [
    path('', views.EventListCreateView.as_view(), name='event-list-create'),
    path('check-in/', views.CheckInView.as_view(), name='event-check-in'),
    path('my-registrations/', views.MyRegistrationsView.as_view(), name='my-registrations'),
    path('<int:pk>/', views.EventDetailView.as_view(), name='event-detail'),
    path('<int:pk>/register/', views.EventRegisterView.as_view(), name='event-register'),
]