"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const fee_service_1 = require("../common/services/fee.service");
async function verifyFees() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const feeService = app.get(fee_service_1.FeeService);
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
    }
    catch (error) {
        console.error('Error verifying fees:', error);
    }
    finally {
        await app.close();
    }
}
verifyFees();
//# sourceMappingURL=verify-fees.js.map