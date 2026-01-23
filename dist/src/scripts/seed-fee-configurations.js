"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const fee_service_1 = require("../common/services/fee.service");
const common_enum_1 = require("../enums/common.enum");
async function seedFeeConfigurations() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const feeService = app.get(fee_service_1.FeeService);
    try {
        console.log('Seeding fee configurations...');
        const currencies = ['EUR', 'CZK', 'NGN'];
        for (const currency of currencies) {
            console.log(`\n--- Seeding fees for ${currency} ---`);
            await feeService.createFeeConfiguration({
                name: `Transfer Fee (${currency})`,
                type: common_enum_1.FeeType.TRANSFER_FEE,
                percentage: 4,
                currency,
            });
            console.log(`✓ Created transfer fee for ${currency} (4%)`);
        }
        console.log('\n✅ All fee configurations seeded successfully!');
    }
    catch (error) {
        console.error('Error seeding fee configurations:', error);
    }
    finally {
        await app.close();
    }
}
seedFeeConfigurations();
//# sourceMappingURL=seed-fee-configurations.js.map