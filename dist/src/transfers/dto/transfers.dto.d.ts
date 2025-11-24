export declare class CreateTransferDto {
    amount: number;
    purpose: string;
    paymentMethodId: string;
    recipientBankId?: string;
    recipientAccount?: string;
    recipientName?: string;
    recipientPhone?: string;
    receiverId?: string;
    notes?: string;
    targetCurrency?: string;
}
export declare class TransferQuoteDto {
    amount: number;
    targetCurrency?: string;
    sourceCurrency?: string;
    paymentMethodType?: string;
}
