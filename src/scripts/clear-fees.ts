import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { FeeService } from '../common/services/fee.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fee } from '../entities';

async function clearFees() {
    const app = await NestFactory.createApplicationContext(AppModule);

    try {
        console.log('Clearing fees table...');

        const feeRepository = app.get('FeeRepository') as Repository<Fee>;

        const result = await feeRepository.delete({});

        console.log(`✅ Deleted ${result.affected || 0} fee configurations`);
        console.log('Fees table is now empty.');
    } catch (error) {
        console.error('Error clearing fees table:', error);
    } finally {
        await app.close();
    }
}

clearFees();
