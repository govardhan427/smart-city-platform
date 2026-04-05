from django.core.mail import EmailMultiAlternatives
from email.mime.image import MIMEImage
from django.conf import settings

# Reuse the QR generator we wrote for events
from events.utils import generate_qr_code_bytes 

def send_parking_email(user_email, parking_lot_name, booking, qr_code_bytes):
    """
    Sends a beautifully formatted HTML confirmation email for a Parking Reservation.
    """
    subject = f"🚗 Parking Reserved: {parking_lot_name}"

    # Format date and time safely from the start_time datetime object
    formatted_date = booking.start_time.strftime('%b %d, %Y') if booking.start_time else "TBD"
    formatted_time = booking.start_time.strftime('%I:%M %p') if booking.start_time else "TBD"
    
    # Safely get the maps link if we have the parking lot object
    maps_link = booking.parking_lot.google_maps_url if hasattr(booking, 'parking_lot') and booking.parking_lot.google_maps_url else "https://maps.google.com"
    location_text = booking.parking_lot.location if hasattr(booking, 'parking_lot') else "Metro Area"

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
                    <h2 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">🚗 Parking Spot Reserved!</h2>
                    <p style="margin: 10px 0 0 0; color: #a1a1aa; font-size: 15px;">Your vehicle is cleared for entry.</p>
                </td>
            </tr>

            <tr>
                <td style="background-color: #1a1a1a; border: 1px solid #27272a; border-radius: 16px; padding: 30px;">
                    
                    <h3 style="margin: 0 0 20px 0; color: #ffffff; font-size: 22px; text-align: center;">{parking_lot_name}</h3>

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
                                <p style="margin: 0 0 12px 0; color: #a1a1aa; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Scan at Boom Barrier</p>
                                <div style="background-color: #ffffff; padding: 12px; border-radius: 12px; display: inline-block; margin-bottom: 20px;">
                                    <img src="cid:qr_code" alt="Your QR Code" width="180" height="180" style="display: block;">
                                </div>
                            </td>
                        </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td align="center">
                                <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 12px; display: inline-block; margin-bottom: 10px;">
                                    <span style="color: #a1a1aa; font-size: 12px; text-transform: uppercase; margin-right: 8px;">Vehicle:</span>
                                    <span style="color: #ffffff; font-family: 'Courier New', Courier, monospace; font-size: 16px; font-weight: bold; letter-spacing: 1px;">{booking.vehicle_number}</span>
                                </div>
                                <br>
                                <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 12px; display: inline-block;">
                                    <span style="color: #a1a1aa; font-size: 12px; text-transform: uppercase; margin-right: 8px;">Access ID:</span>
                                    <span style="color: #ffffff; font-family: 'Courier New', Courier, monospace; font-size: 16px; font-weight: bold; letter-spacing: 1px;">{booking.id}</span>
                                </div>
                            </td>
                        </tr>
                    </table>

                </td>
            </tr>

            <tr>
                <td align="center" style="padding-top: 30px;">
                    <p style="margin: 0; color: #71717a; font-size: 14px;">Drive safe!</p>
                    <p style="margin: 5px 0 0 0; color: #71717a; font-size: 13px;">— The Smart City Team</p>
                    <p style="margin: 20px 0 0 0; color: #52525b; font-size: 12px;">Barrier camera not working? Present your Access ID to the attendant.</p>
                </td>
            </tr>
        </table>

    </body>
    </html>
    """

    text_body = f"""
    Parking Reserved: {parking_lot_name}
    
    Date: {formatted_date}
    Time: {formatted_time}
    Location: {location_text}
    Vehicle: {booking.vehicle_number}
    
    Your Access ID is: {booking.id}
    
    Please scan the attached QR code at the gate to enter.
    
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

        # Create the CID Image Attachment
        qr_image = MIMEImage(qr_code_bytes)
        qr_image.add_header('Content-ID', '<qr_code>') # Matches the src="cid:qr_code" in HTML
        qr_image.add_header('Content-Disposition', 'inline', filename=f"parking_qr_{booking.id}.png")
        
        email.attach(qr_image)
        
        email.send()
        print(f"--- Successfully sent REAL HTML email to {user_email} via SendGrid ---")

    except Exception as e:
        print(f"Error sending email via SendGrid: {e}")