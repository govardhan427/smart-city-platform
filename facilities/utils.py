from django.core.mail import EmailMessage
from django.conf import settings
import base64
# We can reuse the QR generator from the events app!
from events.utils import generate_qr_code_bytes 

def send_booking_email(user_email, facility_name, booking, qr_code_bytes):
    """
    Sends a confirmation email for a Facility Booking with QR code.
    """
    subject = f"Booking Confirmation: {facility_name}"
    
    # Encode QR for HTML embedding
    qr_image_base64 = base64.b64encode(qr_code_bytes).decode('utf-8')

    html_body = f"""
    <html>
        <body>
            <h3>Booking Confirmed!</h3>
            <p>You have successfully booked: <strong>{facility_name}</strong>.</p>
            <ul>
                <li><strong>Date:</strong> {booking.booking_date}</li>
                <li><strong>Time Slot:</strong> {booking.get_time_slot_display()}</li>
                <li><strong>Booking ID:</strong> {booking.id}</li>
            </ul>
            <p>Please show this QR code at the facility entrance during your time slot.</p>
            
            <img src="data:image/png;base64,{qr_image_base64}" alt="Booking QR Code">
            
            <p>Best,<br>The Smart City Team</p>
        </body>
    </html>
    """
    
    # Plain text fallback
    text_body = f"""
    Booking Confirmed for {facility_name}.
    Date: {booking.booking_date}
    Time: {booking.time_slot}
    Please present the attached QR code at the entrance.
    """

    try:
        email = EmailMessage(
            subject=subject,
            body=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user_email],
        )
        email.content_subtype = "html"
        email.body = html_body
        
        email.attach(
            filename=f"booking_qr_{booking.id}.png",
            content=qr_code_bytes,
            mimetype="image/png"
        )
        
        email.send()
        print(f"--- Sent Booking Email to {user_email} ---")

    except Exception as e:
        print(f"Error sending booking email: {e}")