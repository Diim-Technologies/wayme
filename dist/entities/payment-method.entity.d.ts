import { PaymentMethodType } from '../enums/common.enum';
import { User } from './user.entity';
import { Transfer } from './transfer.entity';
export declare class PaymentMethod {
    id: string;
    userId: string;
    type: PaymentMethodType;
    isDefault: boolean;
    cardDetails: any;
    bankDetails: any;
    stripeId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    transfers: Transfer[];
}
