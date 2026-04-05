from django.core.mail import EmailMultiAlternatives
from email.mime.image import MIMEImage
from django.conf import settings

# Reuse the QR generator from the events app
from events.utils import generate_qr_code_bytes 

def send_booking_email(user_email, facility, booking, qr_code_bytes):
    """
    Sends a beautifully formatted HTML confirmation email for a Facility Booking.
    """
    subject = f"🏢 Booking Confirmed: {facility.name}"

    # Format date safely
    formatted_date = booking.booking_date.strftime('%b %d, %Y') if booking.booking_date else "TBD"
    # Note: Using get_time_slot_display() for the readable version of the choice field
    formatted_time = booking.get_time_slot_display()
    
    location_text = facility.location or "Address TBD"
    maps_link = facility.google_maps_url or "https://maps.google.com"

    # SVGs removed! Using the Cloudinary URL directly in the HTML below.

    # --- BULLETPROOF HTML EMAIL TEMPLATE ---
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
                    <h2 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">🏢 Booking Confirmed!</h2>
                    <p style="margin: 10px 0 0 0; color: #a1a1aa; font-size: 15px;">Your reservation at {facility.name} is ready.</p>
                </td>
            </tr>

            <tr>
                <td style="background-color: #1a1a1a; border: 1px solid #27272a; border-radius: 16px; padding: 30px;">
                    
                    <h3 style="margin: 0 0 20px 0; color: #ffffff; font-size: 22px; text-align: center;">{facility.name}</h3>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                        <tr>
                            <td width="50%" align="center" style="padding: 12px; background-color: #111113; border-radius: 10px 0 0 10px; border-right: 1px solid #27272a;">
                                <div style="font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Date</div>
                                <div style="font-size: 15px; color: #ffffff; font-weight: 600;">📅 {formatted_date}</div>
                            </td>
                            <td width="50%" align="center" style="padding: 12px; background-color: #111113; border-radius: 0 10px 10px 0;">
                                <div style="font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Slot</div>
                                <div style="font-size: 15px; color: #ffffff; font-weight: 600;">⏰ {formatted_time}</div>
                            </td>
                        </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; text-align: center;">
                        <tr>
                            <td align="center">
                                <p style="margin: 0 0 12px 0; color: #d4d4d8; font-size: 15px;">📍 {location_text}</p>
                                <a href="{maps_link}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; padding: 10px 24px; border-radius: 50px;">
                                    Get Directions ↗
                                </a>
                            </td>
                        </tr>
                    </table>

                    <div style="height: 1px; background-color: #27272a; margin-bottom: 30px;"></div>

                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td align="center">
                                <p style="margin: 0 0 12px 0; color: #a1a1aa; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Present for Entry</p>
                                <div style="background-color: #ffffff; padding: 12px; border-radius: 12px; display: inline-block; margin-bottom: 20px;">
                                    <img src="cid:qr_code" alt="Your QR Code" width="160" height="160" style="display: block;">
                                </div>
                            </td>
                        </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td align="center">
                                <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 10px; display: inline-block;">
                                    <span style="color: #a1a1aa; font-size: 11px; text-transform: uppercase; margin-right: 8px;">Access ID:</span>
                                    <span style="color: #ffffff; font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: bold; letter-spacing: 1px;">{booking.id}</span>
                                </div>
                            </td>
                        </tr>
                    </table>

                </td>
            </tr>

            <tr>
                <td align="center" style="padding-top: 30px;">
                    <p style="margin: 0; color: #71717a; font-size: 14px;">We look forward to seeing you!</p>
                    <p style="margin: 5px 0 0 0; color: #71717a; font-size: 13px;">— The Smart City Team</p>
                    <p style="margin: 20px 0 0 0; color: #52525b; font-size: 12px;">Need assistance? Simply show your Access ID to the facility manager.</p>
                </td>
            </tr>
        </table>

    </body>
    </html>
    """

    text_body = f"""
    Booking Confirmed: {facility.name}
    Date: {formatted_date}
    Time: {formatted_time}
    Location: {location_text}
    Access ID: {booking.id}
    
    Get Directions: {maps_link}
    """

    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user_email],
        )
        email.attach_alternative(html_body, "text/html")

        # Create the CID Image Attachment
        qr_image = MIMEImage(qr_code_bytes)
        qr_image.add_header('Content-ID', '<qr_code>') # Matches the src="cid:qr_code" in HTML
        qr_image.add_header('Content-Disposition', 'inline', filename=f"facility_qr_{booking.id}.png")
        
        email.attach(qr_image)
        
        email.send()
        print(f"--- Sent Facility Booking Email to {user_email} ---")
    except Exception as e:
        print(f"Error sending facility email: {e}")