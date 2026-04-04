from rest_framework import serializers
from .models import Facility, Booking, FacilityReview
from django.utils import timezone
from django.db.models import Avg

# --- NEW: Review Serializer ---
class FacilityReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = FacilityReview
        fields = ['id', 'user_name', 'rating', 'comment', 'created_at']

# --- UPDATED: Facility Serializer ---
class FacilitySerializer(serializers.ModelSerializer):
    reviews = FacilityReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Facility
        fields = '__all__'

    def get_average_rating(self, obj):
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else None

# --- UPDATED: Booking Serializer ---
class BookingSerializer(serializers.ModelSerializer):
    facility_details = FacilitySerializer(source='facility', read_only=True)
    can_review = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = ['id', 'facility', 'facility_details', 'booking_date', 'time_slot', 'created_at', 'is_checked_in', 'can_review']

    def get_can_review(self, obj):
        # TIME BARRIER: Is the booked date in the past?
        is_past = obj.booking_date < timezone.now().date()
        
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            has_reviewed = FacilityReview.objects.filter(facility=obj.facility, user=request.user).exists()
            return is_past and not has_reviewed
        return False