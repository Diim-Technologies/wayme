import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    private initializeTransporter;
    private sendMail;
    sendPasswordResetOTP(email: string, otp: string, firstName: string): Promise<boolean>;
    sendPasswordChangeConfirmation(email: string, firstName: string): Promise<boolean>;
    sendWelcomeEmail(email: string, firstName: string): Promise<boolean>;
    sendTransactionNotification(email: string, firstName: string, transactionDetails: {
        type: 'sent' | 'received' | 'completed' | 'failed';
        amount: string;
        currency: string;
        recipient?: string;
        reference: string;
    }): Promise<boolean>;
    sendKYCStatusUpdate(email: string, firstName: string, status: 'approved' | 'rejected', reason?: string): Promise<boolean>;
    sendBulkEmail(emails: string[], subject: string, html: string): Promise<boolean>;
    sendEmailVerificationOTP(email: string, otp: string, firstName: string): Promise<boolean>;
    sendAdminVerificationOTP(email: string, otp: string, firstName: string): Promise<boolean>;
    sendDisputeCreatedNotification(email: string, disputeId: string, subject: string, firstName: string): Promise<boolean>;
    sendDisputeReplyNotification(email: string, disputeId: string, replyFrom: string, isAdmin: boolean): Promise<boolean>;
    sendDisputeStatusUpdateNotification(email: string, disputeId: string, status: string, firstName: string): Promise<boolean>;
    sendDisputeClosedNotification(email: string, disputeId: string, resolution: string, firstName: string): Promise<boolean>;
}
