import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    sendPasswordResetOTP(email: string, otp: string, firstName: string): Promise<boolean>;
    sendPasswordChangeConfirmation(email: string, firstName: string): Promise<boolean>;
    sendWelcomeEmail(email: string, firstName: string): Promise<boolean>;
}
