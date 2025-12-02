import qrcode
import base64
from io import BytesIO
from django.core.mail import EmailMessage
from PIL import Image
from django.conf import settings

def generate_qr_code_bytes(data):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer.getvalue()



def send_registration_email(user_email, event_title, registration_id, qr_code_bytes):
    subject = f"Your Registration Confirmation for {event_title}"
    qr_image_base64 = base64.b64encode(qr_code_bytes).decode('utf-8')
    html_body = f"""
    <html>
        <body>
            <h3>Hello,</h3>
            <p>Thank you for registering for the event: <strong>{event_title}</strong>.</p>
            <p>Your unique registration ID is: {registration_id}</p>
            <p>Please present this QR code at the event entrance for check-in.</p>
            
            <img src="data:image/png;base64,{qr_image_base64}" alt="Your QR Code">
            
            <p>We look forward to seeing you there!</p>
            <p>Best,<br>The Smart City Team</p>
        </body>
    </html>
    """
    text_body = f"""
    Hello,
    Thank you for registering for the event: {event_title}.
    Your unique registration ID is: {registration_id}
    Please present the attached QR code at the event entrance for check-in.
    We look forward to seeing you there!
    Best,
    The Smart City Team
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
            filename=f"registration_qr_{registration_id}.png",
            content=qr_code_bytes,
            mimetype="image/png"
        )
        
        email.send()
        print(f"--- Successfully sent REAL email to {user_email} via SendGrid ---")

    except Exception as e:
        print(f"Error sending email via SendGrid: {e}")