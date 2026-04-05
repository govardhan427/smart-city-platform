# transport/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import ParkingBooking

@receiver(post_save, sender=ParkingBooking)
def broadcast_parking_update(sender, instance, **kwargs):
    """
    Every time a booking is saved, broadcast the new capacity to the map.
    """
    channel_layer = get_channel_layer()
    
    # FIX 1: Use 'parking_lot' to match your ParkingBooking model
    lot = instance.parking_lot 
    
    # Send a message to the "live_map" group we created in consumers.py
    async_to_sync(channel_layer.group_send)(
        "live_map",
        {
            "type": "map_update",
            "data": {
                "type": "parking",
                "id": lot.id,
                # FIX 2: Use 'available_spaces' to match your ParkingLot model property
                "available_spots": lot.available_spaces 
            }
        }
    )