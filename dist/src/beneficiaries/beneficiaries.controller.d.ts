import { BeneficiariesService } from './beneficiaries.service';
export declare class BeneficiariesController {
    private readonly beneficiariesService;
    constructor(beneficiariesService: BeneficiariesService);
    createBeneficiary(req: any, body: any): Promise<import("../entities").Beneficiary>;
    getUserBeneficiaries(req: any): Promise<import("../entities").Beneficiary[]>;
    getAllBeneficiaries(): Promise<import("../entities").Beneficiary[]>;
    deleteBeneficiary(req: any, id: string): Promise<import("../entities").Beneficiary>;
}
