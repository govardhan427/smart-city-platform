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

    # Updated with the new #40C0E7 color, but kept at 28px to protect your layout!
    svg_logo_1 = """<svg width="28px" height="28px" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--noto" preserveAspectRatio="xMidYMid meet"><path d="M116.6 62.86H73.98c-.66 0-1.19.53-1.19 1.19v17.83c0 .31.12.62.35.84c.22.22.52.35.84.35l13.81-.02C86.74 91.44 77.24 98.3 66.3 98.3C49.43 98.3 39 82.8 39 68.43c0-14.13 10.21-28.75 27.3-28.75c7.41 0 16.95 4.43 21.88 8.71c.24.21.55.3.86.29c.32-.02.62-.17.82-.41l15.85-18.29a1.2 1.2 0 0 0-.09-1.66c-10.14-9.4-23.74-14.37-39.32-14.37c-32.5 0-56.09 22.91-56.09 54.47c0 31.57 23.59 54.48 56.09 54.48c49.01 0 51.49-49.04 51.49-58.87c0-.64-.53-1.17-1.19-1.17z" fill="#40C0E7"></path></svg>"""
    svg_logo_2 = """<svg width="28px" height="28px" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--noto" preserveAspectRatio="xMidYMid meet"><path d="M94.9 71.35c-8.08-7.63-21.82-13.99-30.91-18.2c-1.54-.71-2.93-1.35-4.11-1.92c-3.43-1.65-8.12-6.22-6.1-11.47c1.36-3.55 4.81-5.34 10.27-5.34c1.75 0 3.67.2 5.72.58c7.12 1.33 12.52 3.99 15.58 5.5c.38.19.82.21 1.22.07c.39-.15.72-.45.89-.84l7.01-15.81c.31-.69.07-1.51-.57-1.93c-4.94-3.28-17.27-8.15-30.97-8.15c-1.98 0-3.95.1-5.87.3c-10.92 1.12-21.86 4.03-27.92 17.64c-3.78 8.47-3.77 18.01.01 24.89c4.04 7.51 10.66 10.87 19.04 15.11l1.08.55c6.05 3.02 13.3 6.38 18.07 8.59c7.05 3.4 9.66 9.44 8.04 13.08c-2.61 5.87-8.38 7.16-18.36 4.33c-8.81-2.39-16.94-9.14-19.21-11.15c-.34-.3-.79-.44-1.25-.38c-.45.06-.85.32-1.1.69L24.6 104.14c-.41.63-.32 1.46.22 1.98c5.63 5.43 10.22 8.59 18.17 12.5c5.35 2.63 13.18 4.21 20.95 4.21c8.12 0 27.95-1.88 36.65-19.26c5.55-11.12 3.48-22.84-5.69-32.22z" fill="#40C0E7"></path></svg>"""

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
                <td align="center" style="padding-bottom: 30px;">
                    <table cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="padding-right: 12px; vertical-align: middle;">{svg_logo_1}{svg_logo_2}</td>
                            <td style="vertical-align: middle;"><h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Smart Access Hub</h1></td>
                        </tr>
                    </table>
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