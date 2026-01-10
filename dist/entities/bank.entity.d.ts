import { Transfer } from './transfer.entity';
export declare class Bank {
    id: string;
    name: string;
    code: string;
    country: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    transfers: Transfer[];
}
