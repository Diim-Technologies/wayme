"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
async function checkFees() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    try {
        const feeRepository = app.get('FeeRepository');
        const count = await feeRepository.count();
        console.log(`\n📊 Fees table status:`);
        console.log(`Total records: ${count}`);
        if (count === 0) {
            console.log('✅ Fees table is empty\n');
        }
        else {
            const fees = await feeRepository.find();
            console.log('\n📋 Current fees:');
            fees.forEach(fee => {
                console.log(`  - ${fee.name} (${fee.currency}): ${fee.percentageRate}% + ${fee.fixedAmount || 0}`);
            });
            console.log('');
        }
    }
    catch (error) {
        console.error('Error checking fees table:', error);
    }
    finally {
        await app.close();
    }
}
checkFees();
//# sourceMappingURL=check-fees.js.map