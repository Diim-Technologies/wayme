import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: parseInt(this.configService.get('SMTP_PORT', '587')),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendPasswordResetOTP(email: string, otp: string, firstName: string) {
    const mailOptions = {
      from: this.configService.get('FROM_EMAIL', 'noreply@wayame.com'),
      to: email,
      subject: 'Reset Your Wayame Password',
      html: `
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
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset OTP sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send password reset OTP to ${email}:`, error);
      return false;
    }
  }

  async sendPasswordChangeConfirmation(email: string, firstName: string) {
    const mailOptions = {
      from: this.configService.get('FROM_EMAIL', 'noreply@wayame.com'),
      to: email,
      subject: 'Password Changed Successfully - Wayame',
      html: `
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
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password change confirmation sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send password change confirmation to ${email}:`, error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, firstName: string) {
    const mailOptions = {
      from: this.configService.get('FROM_EMAIL', 'noreply@wayame.com'),
      to: email,
      subject: 'Welcome to Wayame - Your Nigerian Money Transfer Solution',
      html: `
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
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      return false;
    }
  }
}