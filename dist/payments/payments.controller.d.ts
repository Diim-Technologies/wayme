import { RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, PaymentIntentResponseDto } from './dto/create-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createPaymentIntent(req: any, dto: CreatePaymentDto): Promise<PaymentIntentResponseDto>;
    getAvailablePaymentMethods(): Promise<import("../entities").StripePaymentMethod[]>;
    handleWebhook(signature: string, req: RawBodyRequest<Request>): Promise<{
        received: boolean;
    }>;
}
