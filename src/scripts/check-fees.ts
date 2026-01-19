import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import { Fee } from '../entities';

async function checkFees() {
    const app = await NestFactory.createApplicationContext(AppModule);

    try {
        const feeRepository = app.get('FeeRepository') as Repository<Fee>;

        const count = await feeRepository.count();

        console.log(`\n📊 Fees table status:`);
        console.log(`Total records: ${count}`);

        if (count === 0) {
            console.log('✅ Fees table is empty\n');
        } else {
            const fees = await feeRepository.find();
            console.log('\n📋 Current fees:');
            fees.forEach(fee => {
                console.log(`  - ${fee.name} (${fee.currency}): ${fee.percentageRate}% + ${fee.fixedAmount || 0}`);
            });
            console.log('');
        }
    } catch (error) {
        console.error('Error checking fees table:', error);
    } finally {
        await app.close();
    }
}

checkFees();
