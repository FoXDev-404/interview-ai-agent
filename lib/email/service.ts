import nodemailer from 'nodemailer';
import { Resend } from 'resend';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  fromName?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

class EmailService {
  private static instance: EmailService;
  private resend: Resend | null = null;

  private constructor() {
    // Initialize Resend if API key is provided
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_YOUR_API_KEY_HERE') {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send email using Resend
   */
  private async sendWithResend(options: EmailOptions): Promise<EmailResult> {
    try {
      if (!this.resend) {
        throw new Error('Resend API key not configured');
      }

      console.log('📧 Sending email via Resend...');
      
      const fromAddress = options.from || 'AI MockPrep <noreply@resend.dev>';
      console.log('📧 Email payload:', {
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        hasHtml: !!options.html,
        hasText: !!options.text
      });

      const result = await this.resend.emails.send({
        from: fromAddress,
        to: options.to, // Keep as string, not array
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, '') // Strip HTML for text version
      });

      console.log('✅ Resend API response:', result);
      console.log('✅ Resend email sent successfully. ID:', result.data?.id || 'No ID returned');

      return {
        success: true,
        messageId: result.data?.id || `resend-${Date.now()}`,
        provider: 'Resend'
      };

    } catch (error) {
      console.error('❌ Resend email failed:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Resend error',
        provider: 'Resend'
      };
    }
  }

  /**
   * Send email using Gmail SMTP
   */
  private async sendWithGmail(options: EmailOptions): Promise<EmailResult> {
    try {
      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        throw new Error('Gmail credentials not configured');
      }

      // Try different SMTP configurations
      const smtpConfigs = [
        // Gmail configuration with connectionTimeout
        {
          name: 'Gmail Standard',
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, ''), // Remove any spaces
          },
          tls: {
            rejectUnauthorized: false
          },
          connectionTimeout: 10000, // 10 seconds
          greetingTimeout: 5000, // 5 seconds
          socketTimeout: 10000 // 10 seconds
        },
        // Gmail with SSL/TLS (Port 465)
        {
          name: 'Gmail SSL',
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, ''),
          },
          tls: {
            rejectUnauthorized: false
          },
          connectionTimeout: 10000,
          greetingTimeout: 5000,
          socketTimeout: 10000
        },
        // Gmail service configuration (nodemailer shortcut)
        {
          name: 'Gmail Service',
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, ''),
          },
          tls: {
            rejectUnauthorized: false
          },
          connectionTimeout: 10000,
          greetingTimeout: 5000,
          socketTimeout: 10000
        },
        // Gmail with different TLS settings
        {
          name: 'Gmail TLS Relaxed',
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, ''),
          },
          tls: {
            rejectUnauthorized: false,
            ciphers: 'SSLv3'
          },
          connectionTimeout: 15000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
          requireTLS: false
        }
      ];

      let transporter = null;
      let lastError = null;

      for (const config of smtpConfigs) {
        try {
          console.log(`🔄 Trying ${config.name} configuration...`);
          transporter = nodemailer.createTransport(config);
          
          // Try to send a test without full verification first
          console.log(`📧 Testing ${config.name} without verification...`);
          
          // Skip verification for now and try to create transporter
          console.log(`✅ ${config.name} transporter created successfully`);
          break; // Success, exit the loop
          
        } catch (error) {
          console.error(`❌ ${config.name} failed:`, error);
          lastError = error;
          transporter = null;
        }
      }

      if (!transporter) {
        throw new Error(`All Gmail SMTP configurations failed. Last error: ${lastError instanceof Error ? lastError.message : 'Unknown error'}`);
      }

      const mailOptions = {
        from: `"${options.fromName || process.env.SMTP_FROM_NAME || 'AI MockPrep'}" <${options.from || process.env.GMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      };

      const info = await transporter.sendMail(mailOptions);
      
      console.log('✅ Gmail email sent successfully:', {
        messageId: info.messageId,
        response: info.response
      });

      return {
        success: true,
        messageId: info.messageId,
        provider: 'Gmail'
      };

    } catch (error) {
      console.error('❌ Gmail email failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Gmail error',
        provider: 'Gmail'
      };
    }
  }

  /**
   * Send email with Resend as primary, Gmail as fallback
   */
  public async sendEmail(options: EmailOptions): Promise<EmailResult> {
    console.log('📧 Attempting to send email:', {
      to: options.to,
      subject: options.subject,
      useHtml: !!options.html,
      useText: !!options.text
    });

    // Try Resend first if available
    if (this.resend && process.env.USE_RESEND === 'true') {
      console.log('🔄 Using Resend as primary email service...');
      const result = await this.sendWithResend(options);
      
      if (result.success) {
        return result;
      }
      
      // Fallback to Gmail if Resend fails
      console.log('⚠️ Resend failed, falling back to Gmail SMTP...');
      return await this.sendWithGmail(options);
    } else {
      // Use Gmail only
      console.log('🔄 Using Gmail SMTP only (Resend not configured)...');
      const result = await this.sendWithGmail(options);
      
      if (!result.success) {
        console.log('❌ Gmail email failed, no fallback configured');
      }
      
      return result;
    }
  }
}

export default EmailService.getInstance();
