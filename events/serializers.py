# events/serializers.py
from rest_framework import serializers
from .models import Event, Registration, EventReview
from django.utils import timezone
from django.db.models import Avg

# --- NEW: Review Serializer ---
class EventReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = EventReview
        fields = ['id', 'user_name', 'rating', 'comment', 'created_at']

# --- UPDATED: Event Serializer ---
class EventSerializer(serializers.ModelSerializer):
    reviews = EventReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = '__all__'

    def get_average_rating(self, obj):
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else None

# --- UPDATED: Registration Serializer ---
class RegistrationSerializer(serializers.ModelSerializer):
    event_details = EventSerializer(source='event', read_only=True)
    can_review = serializers.SerializerMethodField()

    class Meta:
        model = Registration
        fields = ['id', 'event', 'event_details', 'registered_at', 'attended_at', 'tickets', 'can_review']

    def get_can_review(self, obj):
        is_past = obj.event.date < timezone.now().date()
        
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            has_reviewed = EventReview.objects.filter(event=obj.event, user=request.user).exists()
            return is_past and not has_reviewed
        return False

# --- UPDATED: CheckIn Serializer ---
class CheckInSerializer(serializers.Serializer):
    # Changed from UUIDField to CharField to allow 'prefix:uuid' format
    registration_id = serializers.CharField()