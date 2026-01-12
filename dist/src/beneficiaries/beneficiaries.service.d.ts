import { Repository } from 'typeorm';
import { Beneficiary } from '../entities/beneficiary.entity';
import { User } from '../entities/user.entity';
export declare class BeneficiariesService {
    private beneficiaryRepository;
    private userRepository;
    constructor(beneficiaryRepository: Repository<Beneficiary>, userRepository: Repository<User>);
    createBeneficiary(userId: string, data: Partial<Beneficiary>): Promise<Beneficiary>;
    getUserBeneficiaries(userId: string): Promise<Beneficiary[]>;
    getAllBeneficiaries(): Promise<Beneficiary[]>;
    getBeneficiaryById(id: string, userId: string): Promise<Beneficiary>;
    deleteBeneficiary(id: string, userId: string): Promise<Beneficiary>;
}
