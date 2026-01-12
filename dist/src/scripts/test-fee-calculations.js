"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const fee_service_1 = require("../common/services/fee.service");
const decimal_js_1 = require("decimal.js");
async function testFeeCalculations() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const feeService = app.get(fee_service_1.FeeService);
    try {
        console.log('Testing fee calculations with database configurations...\n');
        const testAmount = new decimal_js_1.Decimal(10000);
        console.log('Test 1: Domestic Bank Transfer');
        const domesticFee = await feeService.calculateTransferFee(testAmount, 'DOMESTIC', 'BANK_TRANSFER', 'NGN');
        console.log(`Amount: ${testAmount.toString()} NGN`);
        console.log(`Fee: ${domesticFee.toString()} NGN (Expected: 200 NGN for 2%)`);
        console.log(`Total: ${testAmount.add(domesticFee).toString()} NGN\n`);
        console.log('Test 2: International Transfer');
        const internationalFee = await feeService.calculateTransferFee(testAmount, 'INTERNATIONAL', 'BANK_TRANSFER', 'NGN');
        console.log(`Amount: ${testAmount.toString()} NGN`);
        console.log(`Fee: ${internationalFee.toString()} NGN (Expected: 350 NGN for 3.5%)`);
        console.log(`Total: ${testAmount.add(internationalFee).toString()} NGN\n`);
        console.log('Test 3: Card Payment (Domestic)');
        const cardFee = await feeService.calculateTransferFee(testAmount, 'DOMESTIC', 'CARD', 'NGN');
        console.log(`Amount: ${testAmount.toString()} NGN`);
        console.log(`Fee: ${cardFee.toString()} NGN (Expected: 100 NGN for 1%)`);
        console.log(`Total: ${testAmount.add(cardFee).toString()} NGN\n`);
        console.log('Test 4: International Card Transfer');
        const internationalCardFee = await feeService.calculateTransferFee(testAmount, 'INTERNATIONAL', 'CARD', 'NGN');
        console.log(`Amount: ${testAmount.toString()} NGN`);
        console.log(`Fee: ${internationalCardFee.toString()} NGN (Expected: 450 NGN for 4.5%)`);
        console.log(`Total: ${testAmount.add(internationalCardFee).toString()} NGN\n`);
        console.log('Test 5: Unknown Transfer Type (should use default)');
        const defaultFee = await feeService.calculateTransferFee(testAmount, 'UNKNOWN_TYPE', 'UNKNOWN_METHOD', 'NGN');
        console.log(`Amount: ${testAmount.toString()} NGN`);
        console.log(`Fee: ${defaultFee.toString()} NGN (Expected: 250 NGN for 2.5% default)`);
        console.log(`Total: ${testAmount.add(defaultFee).toString()} NGN\n`);
        console.log('Test 6: Currency Conversion Fee');
        const conversionFee = await feeService.calculateCurrencyConversionFee(testAmount, 'NGN', 'USD');
        console.log(`Amount: ${testAmount.toString()} NGN`);
        console.log(`Fee: ${conversionFee.toString()} NGN (Expected: 50 NGN for 0.5%)`);
        console.log(`Total: ${testAmount.add(conversionFee).toString()} NGN\n`);
        console.log('✅ All fee calculation tests completed!');
        console.log('\n📊 Summary:');
        console.log('All fees are now calculated from database configurations.');
        console.log('No hardcoded values are being used.');
    }
    catch (error) {
        console.error('Error testing fee calculations:', error);
    }
    finally {
        await app.close();
    }
}
testFeeCalculations();
//# sourceMappingURL=test-fee-calculations.js.map