from rest_framework import permissions

class IsEventManager(permissions.BasePermission):
    """
    Allows access only to users in the 'Event Manager' group (or Superusers).
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.is_superuser or request.user.groups.filter(name='Event Manager').exists()

class IsTransportManager(permissions.BasePermission):
    """
    Allows access only to users in the 'Transport Manager' group (or Superusers).
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.is_superuser or request.user.groups.filter(name='Transport Manager').exists()

class IsFacilityManager(permissions.BasePermission):
    """
    Allows access only to users in the 'Facility Manager' group (or Superusers).
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.is_superuser or request.user.groups.filter(name='Facility Manager').exists()