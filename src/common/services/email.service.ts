import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get('SMTP_HOST');
    const port = this.configService.get('SMTP_PORT');
    const user = this.configService.get('SMTP_USER');
    const pass = this.configService.get('SMTP_PASS');

    if (!host || !user || !pass) {
      this.logger.warn('SMTP configuration is missing. Email service will not work.');
      return;
    }

    const portNumber = parseInt(port) || 587;
    const isSecure = portNumber === 465;

    this.transporter = nodemailer.createTransport({
      host,
      port: portNumber,
      secure: isSecure, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
      // Connection timeout settings
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000, // 10 seconds
      socketTimeout: 10000, // 10 seconds
      // Connection pooling
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      // TLS options
      tls: {
        rejectUnauthorized: false, // Accept self-signed certificates
        minVersion: 'TLSv1.2',
      },
      // Enable debug if needed
      debug: this.configService.get('NODE_ENV') === 'development',
      logger: this.configService.get('NODE_ENV') === 'development',
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('SMTP connection verification failed:', error);
      } else {
        this.logger.log('SMTP transporter initialized and verified successfully');
      }
    });
  }

  private async sendMail(to: string | string[], subject: string, html: string) {
    if (!this.transporter) {
      this.logger.error('Email transporter not initialized. Cannot send email.');
      return false;
    }

    const from = this.configService.get('FROM_EMAIL', 'noreply@wayame.com');

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      return false;
    }
  }

  async sendPasswordResetOTP(email: string, otp: string, firstName: string) {
    const subject = 'Reset Your Wayame Password';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Hello ${firstName},</h2>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              We received a request to reset your Wayame account password. Use the verification code below to reset your password:
            </p>
            
            <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 25px; text-align: center; margin: 25px 0;">
              <h3 style="color: #495057; margin: 0 0 15px 0;">Your Verification Code</h3>
              <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; margin: 15px 0;">
                ${otp}
              </div>
              <p style="color: #6c757d; margin: 15px 0 0 0; font-size: 14px;">
                This code expires in 10 minutes
              </p>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 25px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>🛡️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.
              </p>
            </div>
            
            <p style="font-size: 16px; margin-top: 25px;">
              Enter this code in the Wayame app to create your new password.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <div style="text-align: center; color: #6c757d; font-size: 12px;">
              <p>This email was sent by Wayame Money Transfer</p>
              <p>If you need help, contact us at support@wayame.com</p>
            </div>
          </div>
        </body>
        </html>
      `;

    const success = await this.sendMail(email, subject, html);
    if (success) {
      this.logger.log(`Password reset OTP sent to ${email}`);
    }
    return success;
  }

  async sendPasswordChangeConfirmation(email: string, firstName: string) {
    const subject = 'Password Changed Successfully - Wayame';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Changed</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Password Updated</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Hello ${firstName},</h2>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              Your Wayame account password has been successfully changed on ${new Date().toLocaleDateString()}.
            </p>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #155724; margin: 0 0 10px 0;">🔐 Your Account is Secure</h3>
              <p style="margin: 0; color: #155724;">
                You can now use your new password to access your Wayame account and continue sending money home safely.
              </p>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 25px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>⚠️ Didn't make this change?</strong> If you didn't change your password, please contact our support team immediately at support@wayame.com
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <div style="text-align: center; color: #6c757d; font-size: 12px;">
              <p>This email was sent by Wayame Money Transfer</p>
              <p>For support, contact us at support@wayame.com</p>
            </div>
          </div>
        </body>
        </html>
      `;

    const success = await this.sendMail(email, subject, html);
    if (success) {
      this.logger.log(`Password change confirmation sent to ${email}`);
    }
    return success;
  }

  async sendWelcomeEmail(email: string, firstName: string) {
    const subject = 'Welcome to Wayame - Your Nigerian Money Transfer Solution';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Wayame</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🇳🇬 Welcome to Wayame!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Hello ${firstName},</h2>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              Welcome to Wayame! We're excited to help you send money home to Nigeria quickly, safely, and affordably.
            </p>
            
            <div style="background: white; border-radius: 8px; padding: 25px; margin: 25px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #495057; margin: 0 0 15px 0;">🚀 Get Started</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Complete your profile verification</li>
                <li style="margin-bottom: 8px;">Add your preferred payment method</li>
                <li style="margin-bottom: 8px;">Start sending money to Nigerian banks</li>
              </ul>
            </div>
            
            <p style="font-size: 16px;">
              If you have any questions, our support team is here to help at support@wayame.com
            </p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <div style="text-align: center; color: #6c757d; font-size: 12px;">
              <p>Thanks for choosing Wayame Money Transfer</p>
              <p>Built with ❤️ for the Nigerian diaspora</p>
            </div>
          </div>
        </body>
        </html>
      `;

    const success = await this.sendMail(email, subject, html);
    if (success) {
      this.logger.log(`Welcome email sent to ${email}`);
    }
    return success;
  }

  async sendTransactionNotification(email: string, firstName: string, transactionDetails: {
    type: 'sent' | 'received' | 'completed' | 'failed';
    amount: string;
    currency: string;
    recipient?: string;
    reference: string;
  }) {
    const { type, amount, currency, recipient, reference } = transactionDetails;

    const subjects = {
      sent: 'Money Transfer Initiated - Wayame',
      received: 'Money Transfer Received - Wayame',
      completed: 'Money Transfer Completed - Wayame',
      failed: 'Money Transfer Failed - Wayame'
    };

    const colors = {
      sent: '#007bff',
      received: '#28a745',
      completed: '#28a745',
      failed: '#dc3545'
    };

    const icons = {
      sent: '📤',
      received: '📥',
      completed: '✅',
      failed: '❌'
    };

    const subject = subjects[type];
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Transaction ${type.charAt(0).toUpperCase() + type.slice(1)}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${colors[type]}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">${icons[type]} Transfer ${type.charAt(0).toUpperCase() + type.slice(1)}</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Hello ${firstName},</h2>
            
            <div style="background: white; border-radius: 8px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #495057; margin: 0 0 15px 0;">Transaction Details</h3>
              <p><strong>Amount:</strong> ${currency} ${amount}</p>
              ${recipient ? `<p><strong>Recipient:</strong> ${recipient}</p>` : ''}
              <p><strong>Reference:</strong> ${reference}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <div style="text-align: center; color: #6c757d; font-size: 12px;">
              <p>This email was sent by Wayame Money Transfer</p>
              <p>For support, contact us at support@wayame.com</p>
            </div>
          </div>
        </body>
        </html>
      `;

    const success = await this.sendMail(email, subject, html);
    if (success) {
      this.logger.log(`Transaction notification (${type}) sent to ${email}`);
    }
    return success;
  }

  async sendKYCStatusUpdate(email: string, firstName: string, status: 'approved' | 'rejected', reason?: string) {
    const isApproved = status === 'approved';
    const subject = `KYC Verification ${isApproved ? 'Approved' : 'Update Required'} - Wayame`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>KYC Status Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${isApproved ? '#28a745' : '#dc3545'}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">${isApproved ? '✅' : '📋'} KYC ${isApproved ? 'Approved' : 'Update Required'}</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Hello ${firstName},</h2>
            
            ${isApproved ? `
              <p style="font-size: 16px; margin-bottom: 25px;">
                Great news! Your KYC verification has been approved. You can now enjoy full access to all Wayame services.
              </p>
              
              <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px; padding: 20px; margin: 25px 0;">
                <h3 style="color: #155724; margin: 0 0 10px 0;">🎉 You're All Set!</h3>
                <p style="margin: 0; color: #155724;">
                  You can now send money transfers without limits. Start sending money home to Nigeria today!
                </p>
              </div>
            ` : `
              <p style="font-size: 16px; margin-bottom: 25px;">
                We need some additional information to complete your KYC verification.
              </p>
              
              <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 6px; padding: 20px; margin: 25px 0;">
                <h3 style="color: #721c24; margin: 0 0 10px 0;">📋 Action Required</h3>
                <p style="margin: 0; color: #721c24;">
                  ${reason || 'Please review and update your verification documents.'}
                </p>
              </div>
            `}
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <div style="text-align: center; color: #6c757d; font-size: 12px;">
              <p>This email was sent by Wayame Money Transfer</p>
              <p>For support, contact us at support@wayame.com</p>
            </div>
          </div>
        </body>
        </html>
      `;

    const success = await this.sendMail(email, subject, html);
    if (success) {
      this.logger.log(`KYC status update (${status}) sent to ${email}`);
    }
    return success;
  }

  async sendBulkEmail(emails: string[], subject: string, html: string) {
    // Nodemailer doesn't have a direct "bulk" send like SendGrid's template system in the same way,
    // but we can loop or use BCC. For simplicity and privacy, we'll loop or use BCC.
    // However, for true bulk email, a dedicated service is better.
    // Here we will just send individual emails to keep it simple and reliable for now.

    let successCount = 0;
    for (const email of emails) {
      const success = await this.sendMail(email, subject, html);
      if (success) successCount++;
    }

    this.logger.log(`Bulk email sent to ${successCount}/${emails.length} recipients`);
    return successCount > 0;
  }

  async sendEmailVerificationOTP(email: string, otp: string, firstName: string) {
    const subject = 'Verify Your Email - Wayame';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📧 Verify Your Email</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Hello ${firstName},</h2>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              Thank you for registering with Wayame! Please verify your email address using the code below:
            </p>
            
            <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 25px; text-align: center; margin: 25px 0;">
              <h3 style="color: #495057; margin: 0 0 15px 0;">Your Verification Code</h3>
              <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; margin: 15px 0;">
                ${otp}
              </div>
              <p style="color: #6c757d; margin: 15px 0 0 0; font-size: 14px;">
                This code expires in 10 minutes
              </p>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 25px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>🛡️ Security Notice:</strong> If you didn't create a Wayame account, please ignore this email.
              </p>
            </div>
            
            <p style="font-size: 16px; margin-top: 25px;">
              Enter this code in the Wayame app to verify your email address and start sending money home.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <div style="text-align: center; color: #6c757d; font-size: 12px;">
              <p>This email was sent by Wayame Money Transfer</p>
              <p>If you need help, contact us at support@wayame.com</p>
            </div>
          </div>
        </body>
        </html>
      `;

    const success = await this.sendMail(email, subject, html);
    if (success) {
      this.logger.log(`Email verification OTP sent to ${email}`);
    }
    return success;
  }

  async sendAdminVerificationOTP(email: string, otp: string, firstName: string) {
    const subject = 'Admin Verification Code - Wayame';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Admin Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Admin Verification</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Hello ${firstName},</h2>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              A verification code has been requested for your admin account. Use the code below to complete the verification:
            </p>
            
            <div style="background: white; border: 2px dashed #dc3545; border-radius: 8px; padding: 25px; text-align: center; margin: 25px 0;">
              <h3 style="color: #495057; margin: 0 0 15px 0;">Your Verification Code</h3>
              <div style="font-size: 32px; font-weight: bold; color: #dc3545; letter-spacing: 5px; margin: 15px 0;">
                ${otp}
              </div>
              <p style="color: #6c757d; margin: 15px 0 0 0; font-size: 14px;">
                This code expires in 10 minutes
              </p>
            </div>
            
            <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 6px; padding: 15px; margin: 25px 0;">
              <p style="margin: 0; color: #721c24; font-size: 14px;">
                <strong>⚠️ Security Alert:</strong> This is an admin verification code. If you didn't request this, please contact security immediately at security@wayame.com
              </p>
            </div>
            
            <p style="font-size: 16px; margin-top: 25px;">
              Enter this code to verify your admin privileges and proceed with the requested action.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <div style="text-align: center; color: #6c757d; font-size: 12px;">
              <p>This email was sent by Wayame Money Transfer - Admin System</p>
              <p>For security concerns, contact us at security@wayame.com</p>
            </div>
          </div>
        </body>
        </html>
      `;

    const success = await this.sendMail(email, subject, html);
    if (success) {
      this.logger.log(`Admin verification OTP sent to ${email}`);
    }
    return success;
  }

  async sendDisputeCreatedNotification(email: string, disputeId: string, subject: string, firstName: string) {
    const emailSubject = 'Dispute Created - Wayame';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Dispute Created</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Dispute Created</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Hello ${firstName},</h2>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              Your dispute has been successfully created and our support team has been notified.
            </p>
            
            <div style="background: white; border-radius: 8px; padding: 25px; margin: 25px 0; border-left: 4px solid #f39c12;">
              <h3 style="color: #495057; margin: 0 0 15px 0;">Dispute Details</h3>
              <p style="margin: 5px 0;"><strong>Dispute ID:</strong> ${disputeId}</p>
              <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> OPEN</p>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 25px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>📋 What's Next:</strong> Our support team will review your dispute and respond within 24-48 hours. You will receive email notifications for any updates.
              </p>
            </div>
            
            <p style="font-size: 16px; margin-top: 25px;">
              You can track your dispute status and add additional information by logging into your Wayame account.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <div style="text-align: center; color: #6c757d; font-size: 12px;">
              <p>This email was sent by Wayame Money Transfer</p>
              <p>For support, contact us at support@wayame.com</p>
            </div>
          </div>
        </body>
        </html>
      `;

    const success = await this.sendMail(email, emailSubject, html);
    if (success) {
      this.logger.log(`Dispute created notification sent to ${email}`);
    }
    return success;
  }

  async sendDisputeReplyNotification(email: string, disputeId: string, replyFrom: string, isAdmin: boolean) {
    const emailSubject = isAdmin ? 'Admin Reply to Your Dispute - Wayame' : 'New Reply on Your Dispute - Wayame';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Dispute Reply</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">💬 New Reply</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">New Message on Your Dispute</h2>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              ${isAdmin ? 'Our support team has replied to your dispute.' : `${replyFrom} has added a new message to your dispute.`}
            </p>
            
            <div style="background: white; border-radius: 8px; padding: 25px; margin: 25px 0; border-left: 4px solid #3498db;">
              <h3 style="color: #495057; margin: 0 0 15px 0;">Dispute ID: ${disputeId}</h3>
              <p style="margin: 5px 0;"><strong>From:</strong> ${isAdmin ? 'Wayame Support Team' : replyFrom}</p>
            </div>
            
            <p style="font-size: 16px; margin-top: 25px;">
              Please log in to your Wayame account to view the full message and continue the conversation.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <div style="text-align: center; color: #6c757d; font-size: 12px;">
              <p>This email was sent by Wayame Money Transfer</p>
              <p>For support, contact us at support@wayame.com</p>
            </div>
          </div>
        </body>
        </html>
      `;

    const success = await this.sendMail(email, emailSubject, html);
    if (success) {
      this.logger.log(`Dispute reply notification sent to ${email}`);
    }
    return success;
  }

  async sendDisputeStatusUpdateNotification(email: string, disputeId: string, status: string, firstName: string) {
    const emailSubject = 'Dispute Status Updated - Wayame';
    const statusColors = {
      OPEN: '#f39c12',
      IN_PROGRESS: '#3498db',
      RESOLVED: '#27ae60',
      CLOSED: '#95a5a6',
    };
    const color = statusColors[status] || '#3498db';

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Dispute Status Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${color}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📊 Status Updated</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Hello ${firstName},</h2>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              The status of your dispute has been updated.
            </p>
            
            <div style="background: white; border-radius: 8px; padding: 25px; margin: 25px 0; border-left: 4px solid ${color};">
              <h3 style="color: #495057; margin: 0 0 15px 0;">Dispute ID: ${disputeId}</h3>
              <p style="margin: 5px 0;"><strong>New Status:</strong> <span style="color: ${color}; font-weight: bold;">${status}</span></p>
            </div>
            
            <p style="font-size: 16px; margin-top: 25px;">
              Log in to your Wayame account to view more details and any messages from our support team.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <div style="text-align: center; color: #6c757d; font-size: 12px;">
              <p>This email was sent by Wayame Money Transfer</p>
              <p>For support, contact us at support@wayame.com</p>
            </div>
          </div>
        </body>
        </html>
      `;

    const success = await this.sendMail(email, emailSubject, html);
    if (success) {
      this.logger.log(`Dispute status update notification sent to ${email}`);
    }
    return success;
  }

  async sendDisputeClosedNotification(email: string, disputeId: string, resolution: string, firstName: string) {
    const emailSubject = 'Dispute Resolved - Wayame';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Dispute Resolved</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #27ae60 0%, #229954 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Dispute Resolved</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Hello ${firstName},</h2>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              Your dispute has been resolved and closed by our support team.
            </p>
            
            <div style="background: white; border-radius: 8px; padding: 25px; margin: 25px 0; border-left: 4px solid #27ae60;">
              <h3 style="color: #495057; margin: 0 0 15px 0;">Dispute ID: ${disputeId}</h3>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #27ae60; font-weight: bold;">CLOSED</span></p>
            </div>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #155724; margin: 0 0 10px 0;">Resolution</h3>
              <p style="margin: 0; color: #155724;">${resolution}</p>
            </div>
            
            <p style="font-size: 16px; margin-top: 25px;">
              If you have any further questions or concerns, please don't hesitate to contact our support team.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <div style="text-align: center; color: #6c757d; font-size: 12px;">
              <p>This email was sent by Wayame Money Transfer</p>
              <p>For support, contact us at support@wayame.com</p>
            </div>
          </div>
        </body>
        </html>
      `;

    const success = await this.sendMail(email, emailSubject, html);
    if (success) {
      this.logger.log(`Dispute closed notification sent to ${email}`);
    }
    return success;
  }
}
