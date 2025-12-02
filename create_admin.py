import os
import django

# 1. Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model

def create_superuser():
    User = get_user_model()
    
    # 2. Get credentials from Render Environment Variables
    email = os.environ.get('ADMIN_EMAIL')
    password = os.environ.get('ADMIN_PASSWORD')

    if not email or not password:
        print("No ADMIN_EMAIL or ADMIN_PASSWORD set. Skipping admin creation.")
        return

    # 3. Check if user exists
    if not User.objects.filter(email=email).exists():
        print(f"Creating new superuser: {email}")
        User.objects.create_superuser(email=email, password=password)
    else:
        print("Superuser already exists. Skipping.")

if __name__ == "__main__":
    create_superuser()