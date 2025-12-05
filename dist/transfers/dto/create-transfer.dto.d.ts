export declare class CreateTransferDto {
    amount: number;
    fromCurrency: string;
    toCurrency: string;
    recipientName: string;
    recipientBankId: string;
    recipientAccount: string;
    recipientPhone: string;
    purpose: string;
    notes?: string;
}
export declare class ProceedToTransferResponseDto {
    referenceId: string;
    amount: number;
    fromCurrency: string;
    toCurrency: string;
    exchangeRate: number;
    transferFee: number;
    conversionFee: number;
    totalFee: number;
    totalAmount: number;
    status: string;
}
export declare class ApproveTransferDto {
    notes?: string;
}
