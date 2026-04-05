# users/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User
from .utils import send_welcome_email

@receiver(post_save, sender=User)
def handle_new_user_registration(sender, instance, created, **kwargs):
    if created:
        try:
            send_welcome_email(instance)
        except Exception as e:
            # Log this so it doesn't crash the registration process if email fails
            print(f"Error sending welcome email: {e}")