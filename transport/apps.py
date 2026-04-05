# transport/apps.py
from django.apps import AppConfig

class TransportConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'transport'

    # --- ADD THIS METHOD ---
    def ready(self):
        # This imports the signals file when the app starts, 
        # so Django knows to listen for the post_save triggers!
        import transport.signals