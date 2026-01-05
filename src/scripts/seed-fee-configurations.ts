import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { FeeService } from '../common/services/fee.service';
import { FeeType } from '../enums/common.enum';

async function seedFeeConfigurations() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const feeService = app.get(FeeService);

    try {
        console.log('Seeding fee configurations...');

        // Default transfer fee (applies to all if no specific match)
        await feeService.createFeeConfiguration({
            name: 'Default Transfer Fee',
            type: FeeType.TRANSFER_FEE,
            percentage: 0.025, // 2.5%
            currency: 'NGN',
        });
        console.log('✓ Created default transfer fee');

        // Domestic bank transfer fee
        await feeService.createFeeConfiguration({
            name: 'Domestic Bank Transfer Fee',
            type: FeeType.TRANSFER_FEE,
            percentage: 0.02, // 2%
            transferType: 'DOMESTIC',
            paymentMethod: 'BANK_TRANSFER',
            currency: 'NGN',
        });
        console.log('✓ Created domestic bank transfer fee');

        // International transfer fee
        await feeService.createFeeConfiguration({
            name: 'International Transfer Fee',
            type: FeeType.TRANSFER_FEE,
            percentage: 0.035, // 3.5%
            transferType: 'INTERNATIONAL',
            currency: 'NGN',
        });
        console.log('✓ Created international transfer fee');

        // Card payment fee (additional charge)
        await feeService.createFeeConfiguration({
            name: 'Card Payment Fee',
            type: FeeType.TRANSFER_FEE,
            percentage: 0.01, // 1% additional
            paymentMethod: 'CARD',
            currency: 'NGN',
        });
        console.log('✓ Created card payment fee');

        // International + Card (combined)
        await feeService.createFeeConfiguration({
            name: 'International Card Transfer Fee',
            type: FeeType.TRANSFER_FEE,
            percentage: 0.045, // 4.5%
            transferType: 'INTERNATIONAL',
            paymentMethod: 'CARD',
            currency: 'NGN',
        });
        console.log('✓ Created international card transfer fee');

        // Currency conversion fee
        await feeService.createFeeConfiguration({
            name: 'Currency Conversion Fee',
            type: FeeType.CURRENCY_CONVERSION_FEE,
            percentage: 0.005, // 0.5%
            currency: 'NGN',
        });
        console.log('✓ Created currency conversion fee');

        console.log('\n✅ All fee configurations seeded successfully!');
    } catch (error) {
        console.error('Error seeding fee configurations:', error);
    } finally {
        await app.close();
    }
}

seedFeeConfigurations();
