import qrcode
from io import BytesIO
from django.core.mail import EmailMultiAlternatives
from email.mime.image import MIMEImage
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


# NOTE: We now pass the entire 'event' object so we can grab date, time, and location!
def send_registration_email(user_email, event, registration_id, qr_code_bytes):
    subject = f"🎫 Ticket Confirmed: {event.title}"
    
    formatted_date = event.date.strftime('%b %d, %Y') if event.date else "TBD"
    formatted_time = event.time.strftime('%I:%M %p') if event.time else "TBD"
    location_text = event.location or "Online"
    maps_link = event.google_maps_url or "https://maps.google.com"

    # SVGs removed! Using the Cloudinary URL directly in the HTML below.

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 40px 20px; background-color: #09090b; font-family: 'Segoe UI', Arial, sans-serif; color: #ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 550px; margin: 0 auto;">
            
            <tr>
                <td align="center" style="padding-bottom: 10px;">
                    <img src="https://res.cloudinary.com/dqw1t0dul/image/upload/v1775402855/IMG_20251124_104940_vrwymu.png" alt="Main Logo" style="height: 75px; width: auto; display: block; border: 0;">
                </td>
            </tr>
            <tr>
                <td align="center" style="padding-bottom: 35px;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">Smart Access Hub</h1>
                </td>
            </tr>
            <tr>
                <td align="center" style="padding-bottom: 25px;">
                    <h2 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">🎫 Your Ticket is Confirmed!</h2>
                    <p style="margin: 10px 0 0 0; color: #a1a1aa; font-size: 15px;">Get ready for an amazing experience.</p>
                </td>
            </tr>
            <tr>
                <td style="background-color: #1a1a1a; border: 1px solid #27272a; border-radius: 16px; padding: 30px;">
                    <h3 style="margin: 0 0 20px 0; color: #ffffff; font-size: 22px; text-align: center;">{event.title}</h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                        <tr>
                            <td width="50%" align="center" style="padding: 12px; background-color: #111113; border-radius: 10px 0 0 10px; border-right: 1px solid #27272a;">
                                <div style="font-size: 13px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Date</div>
                                <div style="font-size: 16px; color: #ffffff; font-weight: 600;">📅 {formatted_date}</div>
                            </td>
                            <td width="50%" align="center" style="padding: 12px; background-color: #111113; border-radius: 0 10px 10px 0;">
                                <div style="font-size: 13px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Time</div>
                                <div style="font-size: 16px; color: #ffffff; font-weight: 600;">⏰ {formatted_time}</div>
                            </td>
                        </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; text-align: center;">
                        <tr>
                            <td align="center">
                                <p style="margin: 0 0 12px 0; color: #d4d4d8; font-size: 15px;">📍 {location_text}</p>
                                <a href="{maps_link}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; padding: 10px 24px; border-radius: 50px;">Get Directions ↗</a>
                            </td>
                        </tr>
                    </table>

                    <div style="height: 1px; background-color: #27272a; margin-bottom: 30px;"></div>

                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td align="center">
                                <p style="margin: 0 0 12px 0; color: #a1a1aa; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Scan at Entrance</p>
                                <div style="background-color: #ffffff; padding: 12px; border-radius: 12px; display: inline-block; margin-bottom: 20px;">
                                    <img src="cid:qr_code" alt="Your QR Code" width="180" height="180" style="display: block;">
                                </div>
                            </td>
                        </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td align="center">
                                <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 12px; display: inline-block;">
                                    <span style="color: #a1a1aa; font-size: 12px; text-transform: uppercase; margin-right: 8px;">Access ID:</span>
                                    <span style="color: #ffffff; font-family: 'Courier New', Courier, monospace; font-size: 16px; font-weight: bold; letter-spacing: 1px;">{registration_id}</span>
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td align="center" style="padding-top: 30px;">
                    <p style="margin: 0; color: #71717a; font-size: 14px;">Looking forward to seeing you there!</p>
                    <p style="margin: 5px 0 0 0; color: #71717a; font-size: 13px;">— The Smart City Team</p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    text_body = f"""
    Ticket Confirmed: {event.title}
    
    Date: {formatted_date}
    Time: {formatted_time}
    Location: {location_text}
    
    Your Access ID is: {registration_id}
    
    Please present the attached QR code or your Access ID at the event entrance for check-in.
    
    Get Directions: {maps_link}
    
    Best,
    The Smart City Team
    """

    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user_email],
        )
        email.attach_alternative(html_body, "text/html")

        qr_image = MIMEImage(qr_code_bytes)
        qr_image.add_header('Content-ID', '<qr_code>') 
        qr_image.add_header('Content-Disposition', 'inline', filename=f"ticket_qr_{registration_id}.png")
        
        email.attach(qr_image)
        
        email.send()
        print(f"--- Successfully sent REAL HTML email to {user_email} ---")

    except Exception as e:
        print(f"Error sending email: {e}")