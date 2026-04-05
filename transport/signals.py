# transport/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import ParkingBooking
import pusher

# Initialize the Pusher client
pusher_client = pusher.Pusher(
    app_id=settings.PUSHER_APP_ID,
    key=settings.PUSHER_KEY,
    secret=settings.PUSHER_SECRET,
    cluster=settings.PUSHER_CLUSTER,
    ssl=True
)

@receiver(post_save, sender=ParkingBooking)
def broadcast_parking_update(sender, instance, **kwargs):
    """
    Sends an instant ping to Pusher, which then updates all React clients.
    """
    lot = instance.parking_lot 

    # Trigger an event called 'parking_update' on the 'live_map' channel
    try:
        pusher_client.trigger('live_map', 'parking_update', {
            'type': 'parking',
            'id': lot.id,
            'available_spots': lot.available_spaces 
        })
    except Exception as e:
        print(f"Pusher broadcast failed: {e}")