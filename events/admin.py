from django.contrib import admin
from .models import Event, Registration

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'time', 'location')
    search_fields = ('title', 'location')
    list_filter = ('date',)

@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ('id', 'event', 'user', 'registered_at', 'attended_at')
    search_fields = ('event__title', 'user__email')
    list_filter = ('event', 'attended_at', 'registered_at')
    readonly_fields = ('id', 'user', 'event', 'registered_at', 'attended_at')