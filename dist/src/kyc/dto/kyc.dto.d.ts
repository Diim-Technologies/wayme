import { DocumentType } from '../../enums/kyc.enum';
import { KycStatus } from '../../enums/user.enum';
export declare class SubmitKycFullDto {
    documentType: DocumentType;
}
export declare class SubmitKycDto {
}
export declare class RejectKycDto {
    reason: string;
}
export declare class KycFilterDto {
    status?: KycStatus;
}
