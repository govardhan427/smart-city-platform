# users/utils.py
from django.core.mail import EmailMessage
from django.conf import settings

def send_welcome_email(user):
    """
    Sends a branded welcome email to new users.
    """
    subject = "Welcome to Smart Access Hub!"
    
    # We kept the rocket for flavor, but the main logo is now the Cloudinary PNG
    svg_rocket = """<svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.0334 2.96655C21.0334 2.96655 15.1116 2.37438 9.7782 7.70771L8.59477 8.89114C8.40722 9.07869 8.20455 9.25624 7.98901 9.4223C7.45269 9.83572 6.78652 10.0537 6.11326 10.0537C5.44001 10.0537 4.77383 9.83572 4.23751 9.4223C3.60634 8.93514 2.76672 9.00624 2.2223 9.55066C1.44464 10.3283 1.44464 11.5891 2.2223 12.3668L4.88897 15.0334C4.69348 15.2289 4.49202 15.4185 4.28639 15.6009C3.13645 16.6214 2.22158 17.8427 1.62174 19.182C1.40149 19.6737 1.83842 20.1558 2.33649 19.9839C3.78206 19.4851 5.12782 18.6674 6.27376 17.581C6.46743 17.3973 6.66699 17.2078 6.87198 17.0135L9.63321 19.7747C10.4109 20.5524 11.6717 20.5524 12.4493 19.7747C12.9938 19.2303 13.0649 18.3907 12.5777 17.7595C12.1643 17.2232 11.9463 16.557 11.9463 15.8837C11.9463 15.2105 12.1643 14.5443 12.5777 14.008C12.7438 13.7925 12.9213 13.5898 13.1089 13.4022L14.2923 12.2188C19.6256 6.88544 21.0334 2.96655 21.0334 2.96655Z" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 13L15 9" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>"""

    # Add your Vercel URL here!
    frontend_url = "https://smart-city-platform-six.vercel.app/login"

    # Safely get the username or use 'there' as a fallback
    display_name = user.username or "there"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 40px 20px; background-color: #09090b; font-family: sans-serif; color: #ffffff;">
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
                <td style="background-color: #1a1a1a; border: 1px solid #27272a; border-radius: 16px; padding: 40px; text-align: center;">
                    <div style="margin-bottom: 12px;">{svg_rocket}</div>
                    <h2 style="margin: 0 0 20px 0;">Welcome Aboard!</h2>
                    
                    <p style="color: #a1a1aa; line-height: 1.6;">Hi {display_name}, your account has been successfully created. Explore the city's finest facilities and manage your access all from one place.</p>
                    
                    <div style="margin: 30px 0;">
                        <a href="{frontend_url}" style="background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 50px; font-weight: bold;">Get Started</a>
                    </div>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    # Fallback text for Spam Filters and accessibility
    text_body = f"""
    Welcome to Smart Access Hub!
    
    Hi {display_name}, your account has been successfully created. Explore the city's finest facilities and manage your access all from one place.
    
    Get Started here: {frontend_url}
    """

    try:
        email = EmailMessage(
            subject=subject,
            body=text_body, 
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )
        email.content_subtype = "html"
        email.body = html_body 
        email.send()
        print(f"--- Sent Welcome Email to {user.email} ---")
    except Exception as e:
        print(f"Error sending welcome email: {e}")