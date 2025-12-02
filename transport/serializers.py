from rest_framework import serializers
from .models import ParkingLot, ParkingBooking

class ParkingLotSerializer(serializers.ModelSerializer):
    # Include dynamic properties
    available_spaces = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()

    class Meta:
        model = ParkingLot
        fields = ['id', 'name', 'location', 'rate_per_hour', 'total_capacity', 'available_spaces', 'is_full', 'image_url','google_maps_url']

class ParkingBookingSerializer(serializers.ModelSerializer):
    parking_details = ParkingLotSerializer(source='parking_lot', read_only=True)

    class Meta:
        model = ParkingBooking
        fields = ['id', 'parking_lot', 'parking_details', 'vehicle_number', 'start_time', 'is_active', 'created_at']