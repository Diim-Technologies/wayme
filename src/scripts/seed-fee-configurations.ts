import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { FeeService } from '../common/services/fee.service';
import { FeeType } from '../enums/common.enum';

async function seedFeeConfigurations() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const feeService = app.get(FeeService);

    try {
        console.log('Seeding fee configurations...');

        // Define currencies to seed
        const currencies = ['NGN', 'EUR', 'USD', 'GBP'];

        for (const currency of currencies) {
            console.log(`\n--- Seeding fees for ${currency} ---`);

            // Transfer fee
            await feeService.createFeeConfiguration({
                name: `Transfer Fee (${currency})`,
                type: FeeType.TRANSFER_FEE,
                percentage: 0.025, // 2.5%
                currency,
            });
            console.log(`✓ Created transfer fee for ${currency}`);

            // Currency conversion fee
            await feeService.createFeeConfiguration({
                name: `Currency Conversion Fee (${currency})`,
                type: FeeType.CURRENCY_CONVERSION_FEE,
                percentage: 0.005, // 0.5%
                currency,
            });
            console.log(`✓ Created currency conversion fee for ${currency}`);
        }

        console.log('\n✅ All fee configurations seeded successfully!');
    } catch (error) {
        console.error('Error seeding fee configurations:', error);
    } finally {
        await app.close();
    }
}

seedFeeConfigurations();
