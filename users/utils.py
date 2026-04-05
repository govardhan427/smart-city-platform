# users/utils.py
from django.core.mail import EmailMessage
from django.conf import settings

def send_welcome_email(user):
    """
    Sends a branded welcome email to new users.
    """
    subject = "Welcome to Smart Access Hub!"
    
    # Reuse your brand assets
    svg_logo_1 = """<svg width="28px" height="28px" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><path d="M116.6 62.86H73.98c-.66 0-1.19.53-1.19 1.19v17.83c0 .31.12.62.35.84c.22.22.52.35.84.35l13.81-.02C86.74 91.44 77.24 98.3 66.3 98.3C49.43 98.3 39 82.8 39 68.43c0-14.13 10.21-28.75 27.3-28.75c7.41 0 16.95 4.43 21.88 8.71c.24.21.55.3.86.29c.32-.02.62-.17.82-.41l15.85-18.29a1.2 1.2 0 0 0-.09-1.66c-10.14-9.4-23.74-14.37-39.32-14.37c-32.5 0-56.09 22.91-56.09 54.47c0 31.57 23.59 54.48 56.09 54.48c49.01 0 51.49-49.04 51.49-58.87c0-.64-.53-1.17-1.19-1.17z" fill="#3b82f6"></path></svg>"""
    svg_logo_2 = """<svg width="28px" height="28px" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><path d="M94.9 71.35c-8.08-7.63-21.82-13.99-30.91-18.2c-1.54-.71-2.93-1.35-4.11-1.92c-3.43-1.65-8.12-6.22-6.1-11.47c1.36-3.55 4.81-5.34 10.27-5.34c1.75 0 3.67.2 5.72.58c7.12 1.33 12.52 3.99 15.58 5.5c.38.19.82.21 1.22.07c.39-.15.72-.45.89-.84l7.01-15.81c.31-.69.07-1.51-.57-1.93c-4.94-3.28-17.27-8.15-30.97-8.15c-1.98 0-3.95.1-5.87.3c-10.92 1.12-21.86 4.03-27.92 17.64c-3.78 8.47-3.77 18.01.01 24.89c4.04 7.51 10.66 10.87 19.04 15.11l1.08.55c6.05 3.02 13.3 6.38 18.07 8.59c7.05 3.4 9.66 9.44 8.04 13.08c-2.61 5.87-8.38 7.16-18.36 4.33c-8.81-2.39-16.94-9.14-19.21-11.15c-.34-.3-.79-.44-1.25-.38c-.45.06-.85.32-1.1.69L24.6 104.14c-.41.63-.32 1.46.22 1.98c5.63 5.43 10.22 8.59 18.17 12.5c5.35 2.63 13.18 4.21 20.95 4.21c8.12 0 27.95-1.88 36.65-19.26c5.55-11.12 3.48-22.84-5.69-32.22z" fill="#3b82f6"></path></svg>"""
    
    # New sleek SVG to replace the emoji inside the HTML body
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
                <td align="center" style="padding-bottom: 30px;">
                    <table cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="padding-right: 12px; vertical-align: middle;">{svg_logo_1} {svg_logo_2}</td>
                            <td><h1 style="margin: 0; color: #ffffff; font-size: 24px;">Smart Access Hub</h1></td>
                        </tr>
                    </table>
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