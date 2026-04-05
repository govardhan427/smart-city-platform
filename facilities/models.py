# facilities/models.py
import uuid  # <-- ADD THIS IMPORT
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

User = settings.AUTH_USER_MODEL

class Facility(models.Model):
    # <-- ADD UUID PRIMARY KEY -->
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=255)
    capacity = models.PositiveIntegerField(help_text="Max people per slot")
    image_url = models.URLField(blank=True, help_text="URL to an image of the facility")
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    google_maps_url = models.URLField(blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    def __str__(self):
        return self.name

class Booking(models.Model):
    # <-- ADD UUID PRIMARY KEY -->
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    TIME_SLOTS = (
        ('09:00-11:00', 'Morning (9 AM - 11 AM)'),
        ('12:00-14:00', 'Afternoon (12 PM - 2 PM)'),
        ('15:00-17:00', 'Evening (3 PM - 5 PM)'),
        ('18:00-20:00', 'Night (6 PM - 8 PM)'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='facility_bookings')
    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name='bookings')
    booking_date = models.DateField()
    time_slot = models.CharField(max_length=20, choices=TIME_SLOTS)
    created_at = models.DateTimeField(auto_now_add=True)
    is_checked_in = models.BooleanField(default=False)

    class Meta:
        unique_together = ('facility', 'booking_date', 'time_slot')

    def __str__(self):
        return f"{self.user} - {self.facility.name} ({self.booking_date} {self.time_slot})"

class FacilityReview(models.Model):
    # <-- ADD UUID PRIMARY KEY -->
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('facility', 'user')

    def __str__(self):
        return f"{self.user.username} - {self.facility.name} ({self.rating}/5)"