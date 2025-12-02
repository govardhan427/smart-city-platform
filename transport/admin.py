from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import ParkingLot, ParkingBooking

@admin.register(ParkingLot)
class ParkingLotAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'total_capacity', 'rate_per_hour')

@admin.register(ParkingBooking)
class ParkingBookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'parking_lot', 'vehicle_number', 'is_active', 'start_time')
    list_filter = ('is_active', 'parking_lot')