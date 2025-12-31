export declare class TransferQuoteDto {
    amount: number;
    fromCurrency: string;
    toCurrency: string;
    paymentMethod?: string;
}
export declare class TransferQuoteResponseDto {
    amount: number;
    fromCurrency: string;
    toCurrency: string;
    exchangeRate: number;
    convertedAmount: number;
    transferFee: number;
    conversionFee: number;
    totalFee: number;
    totalAmount: number;
    expiresAt: Date;
}
