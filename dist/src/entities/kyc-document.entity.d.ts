import { DocumentType } from '../enums/kyc.enum';
import { User } from './user.entity';
export declare class KycDocument {
    id: string;
    generateId(): void;
    userId: string;
    documentType: DocumentType;
    filePath: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
    isVerified: boolean;
    verifiedAt: Date;
    verifiedBy: string;
    user: User;
    verifier: User;
}
