import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
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
    sendBulkEmail(emails: string[], templateData: any, templateId?: string): Promise<boolean>;
}
