import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import emailService from '@/lib/email/service';

export async function POST(request: NextRequest) {
  console.log('🚀 Contact API called - POST method');
  
  try {
    // First, verify that the user is authenticated
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      console.log('❌ User not authenticated');
      return NextResponse.json(
        { error: 'You must be signed in to send a message' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, mobileNumber, subject, message, newsletter } = body;

    // Validate that the email matches the authenticated user's email
    if (email !== currentUser.email) {
      console.log('❌ Email mismatch - Form:', email, 'User:', currentUser.email);
      return NextResponse.json(
        { error: 'Email must match your registered account email' },
        { status: 403 }
      );
    }

    // Enhanced environment check with explicit logging
    const envCheck = {
      hasGmailUser: !!process.env.GMAIL_USER,
      hasGmailPassword: !!process.env.GMAIL_APP_PASSWORD,
      hasSendGridKey: !!process.env.SENDGRID_API_KEY,
      gmailUser: process.env.GMAIL_USER,
      useSendGrid: process.env.USE_SENDGRID === 'true',
      timestamp: new Date().toISOString(),
      authenticatedUser: currentUser.email
    };
    
    console.log('📋 Environment check:', envCheck);

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format');
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Log submission details
    console.log('📝 Contact form submission:', {
      name: `${firstName} ${lastName}`,
      email,
      mobileNumber,
      subject,
      messageLength: message.length,
      newsletter,
      timestamp: new Date().toISOString(),
    });

    // Send email using enhanced email service with automatic fallback
    try {
      console.log('📧 Sending email using enhanced email service...');
      
      const emailResult = await emailService.sendEmail({
        to: 'localghost678@gmail.com', // Send to business support email
        subject: `[AI MockPrep Contact] ${subject}`,
        from: 'Aimockprep@resend.dev', // Use Resend's default verified domain
        fromName: 'AI MockPrep Contact',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">
              🔔 New Contact Form Submission
            </h2>
            
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h4 style="color: #28a745; margin: 0 0 10px 0;">✅ Verified User</h4>
              <p style="margin: 0; font-size: 14px; color: #155724;">
                This message was sent by an authenticated user with verified email address.
              </p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #4F46E5; margin-top: 0;">Contact Information</h3>
              <p><strong>Name:</strong> ${firstName} ${lastName}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>Mobile:</strong> ${mobileNumber || 'Not provided'}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Newsletter:</strong> ${newsletter ? 'Yes' : 'No'}</p>
              <p><strong>User ID:</strong> ${currentUser.uid}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h3 style="color: #333; margin-top: 0;">Message</h3>
              <p style="line-height: 1.6; color: #555; white-space: pre-wrap;">${message}</p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #f0f4ff; border-radius: 8px;">
              <p style="margin: 0; font-size: 12px; color: #666;">
                📧 This message was sent from the AI MockPrep contact form by a verified user.<br>
                Reply directly to this email to respond to ${firstName}.<br>
                🔒 User authentication verified: ${currentUser.email}
              </p>
            </div>
          </div>
        `,
        text: `
🔔 NEW CONTACT FORM SUBMISSION

✅ VERIFIED USER
This message was sent by an authenticated user with verified email address.

CONTACT INFORMATION
Name: ${firstName} ${lastName}
Email: ${email}
Mobile: ${mobileNumber || 'Not provided'}
Subject: ${subject}
Newsletter: ${newsletter ? 'Yes' : 'No'}
User ID: ${currentUser.uid}
Time: ${new Date().toLocaleString()}

MESSAGE
${message}

📧 This message was sent from the AI MockPrep contact form by a verified user.
Reply directly to this email to respond to ${firstName}.
🔒 User authentication verified: ${currentUser.email}
        `
      });

      if (emailResult.success) {
        console.log(`✅ Email sent successfully via ${emailResult.provider}:`, {
          messageId: emailResult.messageId,
          to: 'localghost678@gmail.com', // Business support email
          subject: `[AI MockPrep Contact] ${subject}`,
        });

        return NextResponse.json({
          success: true,
          message: `Message sent successfully via ${emailResult.provider}!`,
          timestamp: new Date().toISOString(),
          messageId: emailResult.messageId,
          provider: emailResult.provider,
          emailSent: true
        });
      } else {
        console.error('❌ All email services failed:', emailResult.error);
        
        // Log the message for manual review even if email fails
        console.log('📝 CONTACT MESSAGE LOGGED (Email failed):', {
          name: `${firstName} ${lastName}`,
          email: email,
          subject: subject,
          mobileNumber: mobileNumber,
          message: message,
          newsletter: newsletter,
          userId: currentUser.uid,
          timestamp: new Date().toISOString(),
          provider: emailResult.provider,
          error: emailResult.error
        });
        
        return NextResponse.json({
          success: true, // Still return success so user doesn't get error
          message: 'Message received! We\'ll get back to you soon.',
          timestamp: new Date().toISOString(),
          emailSent: false,
          note: 'Message logged for manual review',
          fallbackMessage: 'Email service temporarily unavailable, but your message has been recorded.'
        });
      }

    } catch (emailError) {
      console.error('❌ Email service error:', emailError);
      
      return NextResponse.json({
        success: false,
        message: 'Email service temporarily unavailable',
        error: emailError instanceof Error ? emailError.message : 'Unknown email error',
        emailSent: false,
        fallbackMessage: 'Your message has been logged. We will respond manually if needed.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}

// Add GET method for testing
export async function GET() {
  console.log('🧪 Contact API test - GET method');
  
  return NextResponse.json({
    status: 'Contact API is working',
    timestamp: new Date().toISOString(),
    environment: {
      GMAIL_USER: process.env.GMAIL_USER || 'Not set',
      GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? 'Set (hidden)' : 'Not set',
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? 'Set (hidden)' : 'Not set',
      USE_SENDGRID: process.env.USE_SENDGRID || 'false'
    }
  });
}
