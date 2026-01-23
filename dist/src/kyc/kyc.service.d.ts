import { Repository, DataSource } from 'typeorm';
import { KycDocument, User, UserProfile } from '../entities';
import { DocumentType } from '../enums/kyc.enum';
import { KycStatus } from '../enums/user.enum';
import { EmailService } from '../common/services/email.service';
import { RejectKycDto, KycFilterDto } from './dto/kyc.dto';
import { ConfigService } from '@nestjs/config';
export declare class KycService {
    private kycDocumentRepository;
    private userRepository;
    private userProfileRepository;
    private dataSource;
    private emailService;
    private configService;
    constructor(kycDocumentRepository: Repository<KycDocument>, userRepository: Repository<User>, userProfileRepository: Repository<UserProfile>, dataSource: DataSource, emailService: EmailService, configService: ConfigService);
    uploadDocument(userId: string, file: Express.Multer.File, documentType: DocumentType): Promise<{
        id: string;
        documentType: DocumentType;
        fileUrl: string;
        fileName: string;
        uploadedAt: Date;
    }>;
    submitKyc(userId: string): Promise<{
        message: string;
        status: KycStatus;
    }>;
    submitFullKyc(userId: string, idFile: Express.Multer.File, selfieFile: Express.Multer.File | undefined, documentType: DocumentType): Promise<{
        message: string;
        status: KycStatus;
    }>;
    getMyDocuments(userId: string): Promise<{
        id: string;
        documentType: DocumentType;
        fileUrl: string;
        fileName: string;
        fileSize: number;
        uploadedAt: Date;
        isVerified: boolean;
    }[]>;
    getKycStatus(userId: string): Promise<{
        kycStatus: KycStatus;
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
    getAllSubmissions(page?: number, limit?: number, filters?: KycFilterDto): Promise<{
        submissions: {
            userId: string;
            email: string;
            firstName: string;
            lastName: string;
            kycStatus: KycStatus;
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
            kycStatus: KycStatus;
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
    approveKyc(userId: string, adminId: string): Promise<{
        message: string;
        userId: string;
        kycStatus: KycStatus;
    }>;
    rejectKyc(userId: string, adminId: string, rejectDto: RejectKycDto): Promise<{
        message: string;
        userId: string;
        kycStatus: KycStatus;
        reason: string;
    }>;
}
