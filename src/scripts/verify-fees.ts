import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { FeeService } from '../common/services/fee.service';

async function verifyFees() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const feeService = app.get(FeeService);

    try {
        console.log('Verifying fee configurations...\n');

        const fees = await feeService.getAllFeeConfigurations();

        console.log(`Total fee configurations: ${fees.length}\n`);

        fees.forEach(fee => {
            console.log(`✓ ${fee.name}`);
            console.log(`  Type: ${fee.type}`);
            console.log(`  Currency: ${fee.currency}`);
            console.log(`  Percentage: ${fee.percentageRate}%`);
            console.log(`  Fixed Amount: ${fee.fixedAmount || 'N/A'}`);
            console.log(`  Active: ${fee.isActive}`);
            console.log('');
        });

        console.log('✅ Verification complete!');
    } catch (error) {
        console.error('Error verifying fees:', error);
    } finally {
        await app.close();
    }
}

verifyFees();
