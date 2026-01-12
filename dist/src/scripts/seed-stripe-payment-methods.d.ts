import { DataSource } from 'typeorm';
export declare function seedStripePaymentMethods(dataSource: DataSource): Promise<{
    created: number;
    updated: number;
    skipped: number;
    total: number;
}>;
