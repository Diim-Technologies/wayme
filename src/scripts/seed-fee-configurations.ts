import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { FeeService } from '../common/services/fee.service';
import { FeeType } from '../enums/common.enum';

async function seedFeeConfigurations() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const feeService = app.get(FeeService);

    try {
        console.log('Seeding fee configurations...');

        // Define currencies to seed: EUR, CZK, NGN only
        const currencies = ['EUR', 'CZK', 'NGN'];

        for (const currency of currencies) {
            console.log(`\n--- Seeding fees for ${currency} ---`);

            // Transfer fee - 4% for all currencies
            await feeService.createFeeConfiguration({
                name: `Transfer Fee (${currency})`,
                type: FeeType.TRANSFER_FEE,
                percentage: 4, // 4%
                currency,
            });
            console.log(`✓ Created transfer fee for ${currency} (4%)`);
        }

        console.log('\n✅ All fee configurations seeded successfully!');
    } catch (error) {
        console.error('Error seeding fee configurations:', error);
    } finally {
        await app.close();
    }
}

seedFeeConfigurations();
