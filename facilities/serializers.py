from rest_framework import serializers
from .models import Facility, Booking

class FacilitySerializer(serializers.ModelSerializer):
    """
    Serializer to view facility details.
    """
    class Meta:
        model = Facility
        fields = ['id', 'name', 'description', 'location', 'capacity', 'image_url','price', 'google_maps_url']

class BookingSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and viewing bookings.
    """
    # We include the full facility details so the frontend can show the name/location easily
    facility_details = FacilitySerializer(source='facility', read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'facility', 'facility_details', 'booking_date', 'time_slot', 'created_at']
        read_only_fields = ['id', 'created_at']
        
        # The unique validator in the model will automatically trigger a 400 error
        # if someone tries to book the same slot twice.