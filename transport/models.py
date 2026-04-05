# transport/models.py
import uuid  # <-- ADD THIS IMPORT
from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class ParkingLot(models.Model):
    # <-- ADD UUID PRIMARY KEY -->
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=255)
    total_capacity = models.PositiveIntegerField(help_text="Total spaces available")
    rate_per_hour = models.DecimalField(max_digits=6, decimal_places=2)
    image_url = models.URLField(blank=True)
    google_maps_url = models.URLField(blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)  
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True) 

    def __str__(self):
        return self.name
    
    @property
    def available_spaces(self):
        active_count = self.bookings.filter(is_active=True).count()
        return max(0, self.total_capacity - active_count)

    @property
    def is_full(self):
        return self.available_spaces == 0

class ParkingBooking(models.Model):
    # <-- ADD UUID PRIMARY KEY -->
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='parking_bookings')
    parking_lot = models.ForeignKey(ParkingLot, on_delete=models.CASCADE, related_name='bookings')
    vehicle_number = models.CharField(max_length=20)
    start_time = models.DateTimeField()
    is_active = models.BooleanField(default=True) 
    created_at = models.DateTimeField(auto_now_add=True)
    is_checked_in = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.parking_lot.name} - {self.vehicle_number}"

class ParkingFeedback(models.Model):
    # <-- ADD UUID PRIMARY KEY -->
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_accurate = models.BooleanField() 
    forecast_datetime = models.DateTimeField() 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - Accurate: {self.is_accurate}"