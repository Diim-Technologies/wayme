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
        await feeService.createFeeConfiguration({
            name: 'Default Transfer Fee',
            type: common_enum_1.FeeType.TRANSFER_FEE,
            percentage: 0.025,
            currency: 'NGN',
        });
        console.log('✓ Created default transfer fee');
        await feeService.createFeeConfiguration({
            name: 'Domestic Bank Transfer Fee',
            type: common_enum_1.FeeType.TRANSFER_FEE,
            percentage: 0.02,
            transferType: 'DOMESTIC',
            paymentMethod: 'BANK_TRANSFER',
            currency: 'NGN',
        });
        console.log('✓ Created domestic bank transfer fee');
        await feeService.createFeeConfiguration({
            name: 'International Transfer Fee',
            type: common_enum_1.FeeType.TRANSFER_FEE,
            percentage: 0.035,
            transferType: 'INTERNATIONAL',
            currency: 'NGN',
        });
        console.log('✓ Created international transfer fee');
        await feeService.createFeeConfiguration({
            name: 'Card Payment Fee',
            type: common_enum_1.FeeType.TRANSFER_FEE,
            percentage: 0.01,
            paymentMethod: 'CARD',
            currency: 'NGN',
        });
        console.log('✓ Created card payment fee');
        await feeService.createFeeConfiguration({
            name: 'International Card Transfer Fee',
            type: common_enum_1.FeeType.TRANSFER_FEE,
            percentage: 0.045,
            transferType: 'INTERNATIONAL',
            paymentMethod: 'CARD',
            currency: 'NGN',
        });
        console.log('✓ Created international card transfer fee');
        await feeService.createFeeConfiguration({
            name: 'Currency Conversion Fee',
            type: common_enum_1.FeeType.CURRENCY_CONVERSION_FEE,
            percentage: 0.005,
            currency: 'NGN',
        });
        console.log('✓ Created currency conversion fee');
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