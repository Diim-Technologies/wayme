import { DataSource } from 'typeorm';
import typeormConfig from './src/config/typeorm.config';

async function checkKycStatusDefault() {
    const AppDataSource = typeormConfig;
    try {
        await AppDataSource.initialize();
        console.log('DB Connected');

        const queryRunner = AppDataSource.createQueryRunner();
        const hasUsers = await queryRunner.hasTable('users');
        console.log(`Users Table Exists: ${hasUsers}`);

        if (hasUsers) {
            const table = await queryRunner.getTable('users');
            const kycCol = table.columns.find(c => c.name === 'kycStatus');
            console.log(`kycStatus Column Info:`);
            console.log(`- Type: ${kycCol?.type}`);
            console.log(`- Default: ${kycCol?.default}`);
            console.log(`- IsNullable: ${kycCol?.isNullable}`);
        }

        await AppDataSource.destroy();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkKycStatusDefault();
