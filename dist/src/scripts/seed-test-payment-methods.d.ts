import { DataSource } from 'typeorm';
export declare function seedTestPaymentMethods(dataSource: DataSource): Promise<{
    created: number;
    skipped: number;
    message: string;
    usersProcessed?: undefined;
} | {
    created: number;
    skipped: number;
    usersProcessed: number;
    message?: undefined;
}>;
