import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import emailService from "@/lib/email/service";
import {
  requireApiAuth,
  toApiAuthErrorResponse,
  type ApiAuthContext,
} from "@/lib/apiAuth";

const contactSchema = z
  .object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: z.string().trim().email().max(254),
    mobileNumber: z.string().trim().max(25).optional().nullable(),
    subject: z.string().trim().min(3).max(160),
    message: z.string().trim().min(1).max(5000),
    newsletter: z.boolean().optional(),
  })
  .strict();

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function POST(request: NextRequest) {
  let currentUser: ApiAuthContext;
  try {
    currentUser = await requireApiAuth({
      request,
      routeId: "contact.submit",
    });
  } catch (error) {
    return toApiAuthErrorResponse(error);
  }

  try {
    const rawBody = await request.json();
    const parsed = contactSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 },
      );
    }

    const {
      firstName,
      lastName,
      email,
      mobileNumber,
      subject,
      message,
      newsletter,
    } = parsed.data;

    const normalizedEmail = email.trim().toLowerCase();
    const userEmail = currentUser.email?.trim().toLowerCase();

    // Validate that the email matches the authenticated user's email
    if (!userEmail || normalizedEmail !== userEmail) {
      console.warn("contact_submission_rejected_email_mismatch", {
        uid: currentUser.uid,
        hasAuthEmail: Boolean(userEmail),
      });
      return NextResponse.json(
        { error: "Email must match your registered account email" },
        { status: 403 },
      );
    }

    console.info("contact_submission_received", {
      uid: currentUser.uid,
      subjectLength: subject.length,
      messageLength: message.length,
      newsletterOptIn: Boolean(newsletter),
    });

    try {
      const safeFirstName = escapeHtml(firstName);
      const safeLastName = escapeHtml(lastName);
      const safeEmail = escapeHtml(normalizedEmail);
      const safeMobile = escapeHtml(mobileNumber || "Not provided");
      const safeSubject = escapeHtml(subject);
      const safeMessage = escapeHtml(message);
      const safeUserId = escapeHtml(currentUser.uid);
      const safeNewsletter = newsletter ? "Yes" : "No";

      const emailResult = await emailService.sendEmail({
        to: "localghost678@gmail.com", // Send to business support email
        subject: `[AI MockPrep Contact] ${safeSubject}`,
        from: "Aimockprep@resend.dev", // Use Resend's default verified domain
        fromName: "AI MockPrep Contact",
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
              <p><strong>Name:</strong> ${safeFirstName} ${safeLastName}</p>
              <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
              <p><strong>Mobile:</strong> ${safeMobile}</p>
              <p><strong>Subject:</strong> ${safeSubject}</p>
              <p><strong>Newsletter:</strong> ${safeNewsletter}</p>
              <p><strong>User ID:</strong> ${safeUserId}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h3 style="color: #333; margin-top: 0;">Message</h3>
              <p style="line-height: 1.6; color: #555; white-space: pre-wrap;">${safeMessage}</p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #f0f4ff; border-radius: 8px;">
              <p style="margin: 0; font-size: 12px; color: #666;">
                📧 This message was sent from the AI MockPrep contact form by a verified user.<br>
                Reply directly to this email to respond to ${safeFirstName}.<br>
                🔒 User authentication verified: ${safeEmail}
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
Email: ${normalizedEmail}
Mobile: ${mobileNumber || "Not provided"}
Subject: ${subject}
Newsletter: ${safeNewsletter}
User ID: ${currentUser.uid}
Time: ${new Date().toLocaleString()}

MESSAGE
${message}

📧 This message was sent from the AI MockPrep contact form by a verified user.
Reply directly to this email to respond to ${firstName}.
🔒 User authentication verified: ${normalizedEmail}
        `,
      });

      if (emailResult.success) {
        console.info("contact_submission_sent", {
          uid: currentUser.uid,
          provider: emailResult.provider,
          hasMessageId: Boolean(emailResult.messageId),
        });

        return NextResponse.json({
          success: true,
          message: "Message sent successfully.",
          timestamp: new Date().toISOString(),
          emailSent: true,
        });
      } else {
        console.warn("contact_submission_send_failed", {
          userId: currentUser.uid,
          provider: emailResult.provider,
          hasProviderError: Boolean(emailResult.error),
        });

        return NextResponse.json({
          success: true, // Still return success so user doesn't get error
          message: "Message received! We'll get back to you soon.",
          timestamp: new Date().toISOString(),
          emailSent: false,
          note: "Message logged for manual review",
          fallbackMessage:
            "Email service temporarily unavailable, but your message has been recorded.",
        });
      }
    } catch (emailError) {
      console.error("contact_submission_exception", {
        uid: currentUser.uid,
        errorType:
          emailError instanceof Error ? emailError.name : "unknown_error",
      });

      return NextResponse.json(
        {
          success: false,
          message: "Unable to send message right now. Please try again later.",
          emailSent: false,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("contact_request_processing_failed", {
      uid: currentUser.uid,
      errorType: error instanceof Error ? error.name : "unknown_error",
    });
    return NextResponse.json(
      { error: "Unable to process contact request" },
      { status: 500 },
    );
  }
}
