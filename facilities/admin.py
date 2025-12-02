from django.contrib import admin

from django.contrib import admin
from .models import Facility, Booking

@admin.register(Facility)
class FacilityAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'capacity')
    search_fields = ('name', 'location')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'facility', 'booking_date', 'time_slot', 'created_at')
    list_filter = ('facility', 'booking_date', 'time_slot')
    search_fields = ('user__email', 'facility__name')