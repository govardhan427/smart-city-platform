from django.db import models

from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Facility(models.Model):
    """
    Represents a public facility (Gym, Hall, Court, Library).
    """
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=255)
    capacity = models.PositiveIntegerField(help_text="Max people per slot")
    image_url = models.URLField(blank=True, help_text="URL to an image of the facility")
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00) # Price per slot
    google_maps_url = models.URLField(blank=True)
    def __str__(self):
        return self.name

class Booking(models.Model):
    """
    A reservation for a facility.
    """
    # Simple predefined time slots for now
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

    class Meta:
        # A facility cannot be double-booked for the same slot on the same day
        # (For this MVP, we assume 1 booking fills the whole facility to keep logic simple)
        unique_together = ('facility', 'booking_date', 'time_slot')

    def __str__(self):
        return f"{self.user} - {self.facility.name} ({self.booking_date} {self.time_slot})"