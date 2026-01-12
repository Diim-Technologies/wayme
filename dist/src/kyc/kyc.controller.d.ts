import { KycService } from './kyc.service';
import { UploadDocumentDto, RejectKycDto, KycFilterDto } from './dto/kyc.dto';
import { DocumentType } from '../enums/kyc.enum';
export declare class KycController {
    private kycService;
    constructor(kycService: KycService);
    uploadGovernmentId(req: any, file: Express.Multer.File, dto: UploadDocumentDto): Promise<{
        id: string;
        documentType: DocumentType;
        fileUrl: string;
        fileName: string;
        uploadedAt: Date;
    } | {
        message: string;
    }>;
    uploadSelfie(req: any, file: Express.Multer.File): Promise<{
        id: string;
        documentType: DocumentType;
        fileUrl: string;
        fileName: string;
        uploadedAt: Date;
    }>;
    submitKyc(req: any): Promise<{
        message: string;
        status: import("../enums/user.enum").KycStatus;
    }>;
    getMyDocuments(req: any): Promise<{
        id: string;
        documentType: DocumentType;
        fileUrl: string;
        fileName: string;
        fileSize: number;
        uploadedAt: Date;
        isVerified: boolean;
    }[]>;
    getKycStatus(req: any): Promise<{
        kycStatus: import("../enums/user.enum").KycStatus;
        kycSubmittedAt: Date;
        kycReviewedAt: Date;
        kycRejectionReason: string;
        documents: {
            id: string;
            documentType: DocumentType;
            fileUrl: string;
            fileName: string;
            fileSize: number;
            uploadedAt: Date;
            isVerified: boolean;
        }[];
    }>;
}
export declare class AdminKycController {
    private kycService;
    constructor(kycService: KycService);
    getAllSubmissions(page?: number, limit?: number, filters?: KycFilterDto): Promise<{
        submissions: {
            userId: string;
            email: string;
            firstName: string;
            lastName: string;
            kycStatus: import("../enums/user.enum").KycStatus;
            kycSubmittedAt: Date;
            kycReviewedAt: Date;
            documentCount: number;
            hasGovernmentId: boolean;
            hasSelfie: boolean;
        }[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    getUserKyc(userId: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phoneNumber: string;
            kycStatus: import("../enums/user.enum").KycStatus;
        };
        profile: {
            kycSubmittedAt: Date;
            kycReviewedAt: Date;
            kycRejectionReason: string;
        };
        documents: {
            id: string;
            documentType: DocumentType;
            fileUrl: string;
            fileName: string;
            fileSize: number;
            mimeType: string;
            uploadedAt: Date;
            isVerified: boolean;
        }[];
    }>;
    approveKyc(req: any, userId: string): Promise<{
        message: string;
        userId: string;
        kycStatus: import("../enums/user.enum").KycStatus;
    }>;
    rejectKyc(req: any, userId: string, rejectDto: RejectKycDto): Promise<{
        message: string;
        userId: string;
        kycStatus: import("../enums/user.enum").KycStatus;
        reason: string;
    }>;
}
