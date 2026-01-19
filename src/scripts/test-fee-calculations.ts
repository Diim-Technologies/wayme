import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { FeeService } from '../common/services/fee.service';
import { Decimal } from 'decimal.js';

async function testFeeCalculations() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const feeService = app.get(FeeService);

    try {
        console.log('Testing fee calculations with database configurations...\n');

        const testAmount = new Decimal(10000); // 10,000 NGN

        // Test 1: NGN Transfer
        console.log('Test 1: NGN Transfer');
        const ngnFee = await feeService.calculateTransferFee(
            testAmount,
            'NGN'
        );
        console.log(`Amount: ${testAmount.toString()} NGN`);
        console.log(`Fee: ${ngnFee.toString()} NGN (Expected: 250 NGN for 2.5%)`);
        console.log(`Total: ${testAmount.add(ngnFee).toString()} NGN\n`);

        // Test 2: EUR Transfer
        console.log('Test 2: EUR Transfer');
        const eurFee = await feeService.calculateTransferFee(
            testAmount,
            'EUR'
        );
        console.log(`Amount: ${testAmount.toString()} EUR`);
        console.log(`Fee: ${eurFee.toString()} EUR (Expected: 250 EUR for 2.5%)`);
        console.log(`Total: ${testAmount.add(eurFee).toString()} EUR\n`);

        // Test 3: USD Transfer
        console.log('Test 3: USD Transfer');
        const usdFee = await feeService.calculateTransferFee(
            testAmount,
            'USD'
        );
        console.log(`Amount: ${testAmount.toString()} USD`);
        console.log(`Fee: ${usdFee.toString()} USD (Expected: 250 USD for 2.5%)`);
        console.log(`Total: ${testAmount.add(usdFee).toString()} USD\n`);

        // Test 4: GBP Transfer
        console.log('Test 4: GBP Transfer');
        const gbpFee = await feeService.calculateTransferFee(
            testAmount,
            'GBP'
        );
        console.log(`Amount: ${testAmount.toString()} GBP`);
        console.log(`Fee: ${gbpFee.toString()} GBP (Expected: 250 GBP for 2.5%)`);
        console.log(`Total: ${testAmount.add(gbpFee).toString()} GBP\n`);

        // Test 5: Currency Conversion Fee
        console.log('Test 5: Currency Conversion Fee');
        const conversionFee = await feeService.calculateCurrencyConversionFee(
            testAmount,
            'NGN',
            'USD'
        );
        console.log(`Amount: ${testAmount.toString()} NGN`);
        console.log(`Fee: ${conversionFee.toString()} NGN (Expected: 50 NGN for 0.5%)`);
        console.log(`Total: ${testAmount.add(conversionFee).toString()} NGN\n`);

        console.log('✅ All fee calculation tests completed!');
        console.log('\n📊 Summary:');
        console.log('All fees are now calculated from database configurations.');
        console.log('Fee calculation is simplified to only consider currency.');
    } catch (error) {
        console.error('Error testing fee calculations:', error);
    } finally {
        await app.close();
    }
}

testFeeCalculations();
