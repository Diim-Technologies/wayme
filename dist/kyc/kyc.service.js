"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const kyc_enum_1 = require("../enums/kyc.enum");
const user_enum_1 = require("../enums/user.enum");
const email_service_1 = require("../common/services/email.service");
const fs = require("fs");
const path = require("path");
let KycService = class KycService {
    constructor(kycDocumentRepository, userRepository, userProfileRepository, dataSource, emailService) {
        this.kycDocumentRepository = kycDocumentRepository;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.dataSource = dataSource;
        this.emailService = emailService;
    }
    async uploadDocument(userId, file, documentType) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const uploadDir = path.join(process.cwd(), 'uploads', 'kyc', userId);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const existingDoc = await this.kycDocumentRepository.findOne({
            where: { userId, documentType },
        });
        if (existingDoc) {
            if (fs.existsSync(existingDoc.filePath)) {
                try {
                    fs.unlinkSync(existingDoc.filePath);
                }
                catch (e) {
                    console.error(`Failed to delete old file: ${existingDoc.filePath}`, e);
                }
            }
            await this.kycDocumentRepository.remove(existingDoc);
        }
        const filePath = file.path;
        const fileUrl = `/uploads/kyc/${userId}/${file.filename}`;
        const kycDocument = this.kycDocumentRepository.create({
            userId,
            documentType,
            filePath,
            fileUrl,
            fileName: file.filename,
            fileSize: file.size,
            mimeType: file.mimetype,
        });
        const savedDocument = await this.kycDocumentRepository.save(kycDocument);
        return {
            id: savedDocument.id,
            documentType: savedDocument.documentType,
            fileUrl: savedDocument.fileUrl,
            fileName: savedDocument.fileName,
            uploadedAt: savedDocument.uploadedAt,
        };
    }
    async submitKyc(userId) {
        const governmentDocs = await this.kycDocumentRepository.find({
            where: [
                { userId, documentType: kyc_enum_1.DocumentType.PASSPORT },
                { userId, documentType: kyc_enum_1.DocumentType.NATIONAL_ID },
                { userId, documentType: kyc_enum_1.DocumentType.RESIDENCE_PERMIT },
            ],
        });
        if (governmentDocs.length === 0) {
            throw new common_1.BadRequestException('Please upload at least one government-issued ID before submitting KYC');
        }
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['profile'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.kycStatus === user_enum_1.KycStatus.PENDING || user.kycStatus === user_enum_1.KycStatus.APPROVED) {
            throw new common_1.BadRequestException(`KYC status is currently ${user.kycStatus}`);
        }
        await this.userProfileRepository.update({ userId }, { kycSubmittedAt: new Date() });
        await this.userRepository.update({ id: userId }, { kycStatus: user_enum_1.KycStatus.PENDING });
        try {
            await this.emailService.sendKycSubmittedNotification(user.email, user.firstName);
        }
        catch (error) {
            console.log('Failed to send KYC submission email:', error);
        }
        return {
            message: 'KYC submitted successfully. Your documents are under review.',
            status: user_enum_1.KycStatus.PENDING,
        };
    }
    async getMyDocuments(userId) {
        const documents = await this.kycDocumentRepository.find({
            where: { userId },
            order: { uploadedAt: 'DESC' },
        });
        return documents.map(doc => ({
            id: doc.id,
            documentType: doc.documentType,
            fileUrl: doc.fileUrl,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            uploadedAt: doc.uploadedAt,
            isVerified: doc.isVerified,
        }));
    }
    async getKycStatus(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['profile'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const documents = await this.getMyDocuments(userId);
        return {
            kycStatus: user.kycStatus,
            kycSubmittedAt: user.profile?.kycSubmittedAt,
            kycReviewedAt: user.profile?.kycReviewedAt,
            kycRejectionReason: user.profile?.kycRejectionReason,
            documents,
        };
    }
    async getAllSubmissions(page = 1, limit = 20, filters) {
        const skip = (page - 1) * limit;
        const where = {};
        if (filters?.status) {
            where.kycStatus = filters.status;
        }
        else {
            where.kycStatus = (0, typeorm_2.Not)(user_enum_1.KycStatus.NOT_SUBMITTED);
        }
        const [users, total] = await this.userRepository.findAndCount({
            where,
            relations: ['profile'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });
        const submissions = await Promise.all(users.map(async (user) => {
            const documents = await this.kycDocumentRepository.find({
                where: { userId: user.id },
            });
            return {
                userId: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                kycStatus: user.kycStatus,
                kycSubmittedAt: user.profile?.kycSubmittedAt,
                kycReviewedAt: user.profile?.kycReviewedAt,
                documentCount: documents.length,
                hasGovernmentId: documents.some(d => d.documentType !== kyc_enum_1.DocumentType.SELFIE),
                hasSelfie: documents.some(d => d.documentType === kyc_enum_1.DocumentType.SELFIE),
            };
        }));
        return {
            submissions,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit,
            },
        };
    }
    async getUserKyc(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['profile'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const documents = await this.kycDocumentRepository.find({
            where: { userId },
            order: { uploadedAt: 'DESC' },
        });
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                kycStatus: user.kycStatus,
            },
            profile: {
                kycSubmittedAt: user.profile?.kycSubmittedAt,
                kycReviewedAt: user.profile?.kycReviewedAt,
                kycRejectionReason: user.profile?.kycRejectionReason,
            },
            documents: documents.map(doc => ({
                id: doc.id,
                documentType: doc.documentType,
                fileUrl: doc.fileUrl,
                fileName: doc.fileName,
                fileSize: doc.fileSize,
                mimeType: doc.mimeType,
                uploadedAt: doc.uploadedAt,
                isVerified: doc.isVerified,
            })),
        };
    }
    async approveKyc(userId, adminId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['profile'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.kycStatus === user_enum_1.KycStatus.APPROVED) {
            throw new common_1.BadRequestException('KYC is already approved');
        }
        await this.dataSource.transaction(async (manager) => {
            await manager.update(entities_1.User, { id: userId }, {
                kycStatus: user_enum_1.KycStatus.APPROVED,
                isVerified: true,
            });
            await manager.update(entities_1.UserProfile, { userId }, {
                kycReviewedAt: new Date(),
                kycReviewedBy: adminId,
                kycRejectionReason: null,
            });
            await manager.update(entities_1.KycDocument, { userId }, {
                isVerified: true,
                verifiedAt: new Date(),
                verifiedBy: adminId,
            });
        });
        try {
            await this.emailService.sendKycApprovedNotification(user.email, user.firstName);
        }
        catch (error) {
            console.log('Failed to send KYC approval email:', error);
        }
        return {
            message: 'KYC approved successfully',
            userId,
            kycStatus: user_enum_1.KycStatus.APPROVED,
        };
    }
    async rejectKyc(userId, adminId, rejectDto) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['profile'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.dataSource.transaction(async (manager) => {
            await manager.update(entities_1.User, { id: userId }, {
                kycStatus: user_enum_1.KycStatus.REJECTED,
            });
            await manager.update(entities_1.UserProfile, { userId }, {
                kycReviewedAt: new Date(),
                kycReviewedBy: adminId,
                kycRejectionReason: rejectDto.reason,
            });
            await manager.update(entities_1.KycDocument, { userId }, {
                isVerified: false,
            });
        });
        try {
            await this.emailService.sendKycRejectedNotification(user.email, user.firstName, rejectDto.reason);
        }
        catch (error) {
            console.log('Failed to send KYC rejection email:', error);
        }
        return {
            message: 'KYC rejected',
            userId,
            kycStatus: user_enum_1.KycStatus.REJECTED,
            reason: rejectDto.reason,
        };
    }
};
exports.KycService = KycService;
exports.KycService = KycService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.KycDocument)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.UserProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        email_service_1.EmailService])
], KycService);
//# sourceMappingURL=kyc.service.js.map