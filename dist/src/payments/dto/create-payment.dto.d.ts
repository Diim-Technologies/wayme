export declare class CreatePaymentDto {
    transferReference: string;
    paymentMethodType?: string;
}
export declare class PaymentIntentResponseDto {
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
    transferReference: string;
}
