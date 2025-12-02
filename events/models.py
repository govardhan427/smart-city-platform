import uuid
from django.db import models
from django.conf import settings

# Get the User model we defined in settings.py
User = settings.AUTH_USER_MODEL

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date = models.DateField()
    time = models.TimeField()
    location = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00) # 0.00 means Free
    image_url = models.URLField(blank=True, help_text="Link to event image")
    google_maps_url = models.URLField(blank=True, help_text="Google Maps Link")
    def __str__(self):
        return self.title

class Registration(models.Model):
    id = models.UUIDField(
         primary_key=True, 
         default=uuid.uuid4, 
         editable=False
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="registrations")
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="registrations")
    registered_at = models.DateTimeField(auto_now_add=True)
    attended_at = models.DateTimeField(null=True, blank=True)
    tickets = models.PositiveIntegerField(default=1)

    class Meta:
        # unique_together = ('user', 'event')
        pass

    def __str__(self):
        return f"{self.user} registered for {self.event.title}"