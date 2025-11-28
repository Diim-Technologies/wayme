import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Beneficiary } from '../entities/beneficiary.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class BeneficiariesService {
    constructor(
        @InjectRepository(Beneficiary)
        private beneficiaryRepository: Repository<Beneficiary>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async createBeneficiary(userId: string, data: Partial<Beneficiary>) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const beneficiary = this.beneficiaryRepository.create({
            ...data,
            userId,
        });

        return this.beneficiaryRepository.save(beneficiary);
    }

    async getUserBeneficiaries(userId: string) {
        return this.beneficiaryRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    async getAllBeneficiaries() {
        return this.beneficiaryRepository.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    async getBeneficiaryById(id: string, userId: string) {
        const beneficiary = await this.beneficiaryRepository.findOne({
            where: { id, userId },
        });

        if (!beneficiary) {
            throw new NotFoundException('Beneficiary not found');
        }

        return beneficiary;
    }

    async deleteBeneficiary(id: string, userId: string) {
        const beneficiary = await this.getBeneficiaryById(id, userId);
        return this.beneficiaryRepository.remove(beneficiary);
    }
}
