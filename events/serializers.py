from rest_framework import serializers
from .models import Event, Registration

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'date', 'time', 'location','price', 'image_url', 'google_maps_url']


class RegistrationSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)
    
    class Meta:
        model = Registration
        # 'id' is our UUID for the QR code
        fields = ['id', 'event', 'tickets', 'registered_at', 'attended_at']


class CheckInSerializer(serializers.Serializer):
    registration_id = serializers.UUIDField()

    def validate_registration_id(self, value):
        try:
            Registration.objects.get(id=value)
        except Registration.DoesNotExist:
            raise serializers.ValidationError("Invalid registration ID. No such booking found.")
        return value