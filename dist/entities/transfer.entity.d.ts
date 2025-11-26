import { TransferStatus } from '../enums/common.enum';
export declare class Transfer {
    id: string;
    senderId: string;
    receiverId: string;
    amount: number;
    fee: number;
    exchangeRate: number;
    sourceCurrency: string;
    targetCurrency: string;
    purpose: string;
    status: TransferStatus;
    reference: string;
    paymentMethodId: string;
    recipientBankId: string;
    recipientAccount: string;
    recipientName: string;
    recipientPhone: string;
    notes: string;
    processedAt: Date;
    completedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    transactions: any[];
    paymentMethod: any;
    receiver: any;
    recipientBank: any;
    sender: any;
}
