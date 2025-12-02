from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class ParkingLot(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=255)
    total_capacity = models.PositiveIntegerField(help_text="Total spaces available")
    rate_per_hour = models.DecimalField(max_digits=6, decimal_places=2)
    image_url = models.URLField(blank=True)
    google_maps_url = models.URLField(blank=True)

    def __str__(self):
        return self.name
    
    @property
    def available_spaces(self):
        # Count active bookings (simple logic: all bookings created today)
        # In a real app, you'd check entry/exit times vs current time.
        active_count = self.bookings.filter(is_active=True).count()
        return max(0, self.total_capacity - active_count)

    @property
    def is_full(self):
        return self.available_spaces == 0

class ParkingBooking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='parking_bookings')
    parking_lot = models.ForeignKey(ParkingLot, on_delete=models.CASCADE, related_name='bookings')
    vehicle_number = models.CharField(max_length=20)
    start_time = models.DateTimeField()
    # We add a flag to manually "complete" a parking session
    is_active = models.BooleanField(default=True) 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.parking_lot.name} - {self.vehicle_number}"