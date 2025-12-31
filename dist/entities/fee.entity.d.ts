import { FeeType } from '../enums/common.enum';
export declare class Fee {
    id: string;
    type: FeeType;
    name: string;
    fixedAmount: number;
    percentageRate: number;
    currency: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
