"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
async function clearFees() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    try {
        console.log('Clearing fees table...');
        const feeRepository = app.get('FeeRepository');
        const result = await feeRepository.delete({});
        console.log(`✅ Deleted ${result.affected || 0} fee configurations`);
        console.log('Fees table is now empty.');
    }
    catch (error) {
        console.error('Error clearing fees table:', error);
    }
    finally {
        await app.close();
    }
}
clearFees();
//# sourceMappingURL=clear-fees.js.map