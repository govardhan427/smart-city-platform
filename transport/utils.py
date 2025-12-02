from django.core.mail import EmailMessage
from django.conf import settings
import base64
# Reuse the QR generator we wrote for events
from events.utils import generate_qr_code_bytes 

def send_parking_email(user_email, parking_lot_name, booking, qr_code_bytes):
    """
    Sends a confirmation email for a Parking Reservation with QR code.
    """
    subject = f"Parking Reserved: {parking_lot_name}"
    
    # Encode QR for HTML embedding
    qr_image_base64 = base64.b64encode(qr_code_bytes).decode('utf-8')

    html_body = f"""
    <html>
        <body>
            <h3>Parking Spot Reserved!</h3>
            <p>You have successfully reserved a spot at: <strong>{parking_lot_name}</strong>.</p>
            <ul>
                <li><strong>Vehicle Number:</strong> {booking.vehicle_number}</li>
                <li><strong>Arrival Time:</strong> {booking.start_time.strftime('%Y-%m-%d %H:%M')}</li>
                <li><strong>Booking ID:</strong> {booking.id}</li>
            </ul>
            <p>Please scan this QR code at the gate to enter.</p>
            
            <img src="data:image/png;base64,{qr_image_base64}" alt="Parking QR Code">
            
            <p>Drive safe,<br>The Smart City Team</p>
        </body>
    </html>
    """
    
    # Plain text fallback
    text_body = f"""
    Parking Reserved at {parking_lot_name}.
    Vehicle: {booking.vehicle_number}
    Arrival: {booking.start_time}
    Please scan the attached QR code at the gate.
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
            filename=f"parking_qr_{booking.id}.png",
            content=qr_code_bytes,
            mimetype="image/png"
        )
        
        email.send()
        print(f"--- Sent Parking Email to {user_email} ---")

    except Exception as e:
        print(f"Error sending parking email: {e}")