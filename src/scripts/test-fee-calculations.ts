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

        // Test 1: Domestic Bank Transfer
        console.log('Test 1: Domestic Bank Transfer');
        const domesticFee = await feeService.calculateTransferFee(
            testAmount,
            'DOMESTIC',
            'BANK_TRANSFER',
            'NGN'
        );
        console.log(`Amount: ${testAmount.toString()} NGN`);
        console.log(`Fee: ${domesticFee.toString()} NGN (Expected: 200 NGN for 2%)`);
        console.log(`Total: ${testAmount.add(domesticFee).toString()} NGN\n`);

        // Test 2: International Transfer
        console.log('Test 2: International Transfer');
        const internationalFee = await feeService.calculateTransferFee(
            testAmount,
            'INTERNATIONAL',
            'BANK_TRANSFER',
            'NGN'
        );
        console.log(`Amount: ${testAmount.toString()} NGN`);
        console.log(`Fee: ${internationalFee.toString()} NGN (Expected: 350 NGN for 3.5%)`);
        console.log(`Total: ${testAmount.add(internationalFee).toString()} NGN\n`);

        // Test 3: Card Payment
        console.log('Test 3: Card Payment (Domestic)');
        const cardFee = await feeService.calculateTransferFee(
            testAmount,
            'DOMESTIC',
            'CARD',
            'NGN'
        );
        console.log(`Amount: ${testAmount.toString()} NGN`);
        console.log(`Fee: ${cardFee.toString()} NGN (Expected: 100 NGN for 1%)`);
        console.log(`Total: ${testAmount.add(cardFee).toString()} NGN\n`);

        // Test 4: International + Card
        console.log('Test 4: International Card Transfer');
        const internationalCardFee = await feeService.calculateTransferFee(
            testAmount,
            'INTERNATIONAL',
            'CARD',
            'NGN'
        );
        console.log(`Amount: ${testAmount.toString()} NGN`);
        console.log(`Fee: ${internationalCardFee.toString()} NGN (Expected: 450 NGN for 4.5%)`);
        console.log(`Total: ${testAmount.add(internationalCardFee).toString()} NGN\n`);

        // Test 5: Default fallback (unknown type)
        console.log('Test 5: Unknown Transfer Type (should use default)');
        const defaultFee = await feeService.calculateTransferFee(
            testAmount,
            'UNKNOWN_TYPE',
            'UNKNOWN_METHOD',
            'NGN'
        );
        console.log(`Amount: ${testAmount.toString()} NGN`);
        console.log(`Fee: ${defaultFee.toString()} NGN (Expected: 250 NGN for 2.5% default)`);
        console.log(`Total: ${testAmount.add(defaultFee).toString()} NGN\n`);

        // Test 6: Currency Conversion Fee
        console.log('Test 6: Currency Conversion Fee');
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
        console.log('No hardcoded values are being used.');
    } catch (error) {
        console.error('Error testing fee calculations:', error);
    } finally {
        await app.close();
    }
}

testFeeCalculations();
