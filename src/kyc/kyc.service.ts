import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
// KYC submission and verification logic
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not, In } from 'typeorm';
import { KycDocument, User, UserProfile } from '../entities';
import { DocumentType } from '../enums/kyc.enum';
import { KycStatus } from '../enums/user.enum';
import { EmailService } from '../common/services/email.service';
import { RejectKycDto, KycFilterDto } from './dto/kyc.dto';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class KycService {
  constructor(
    @InjectRepository(KycDocument)
    private kycDocumentRepository: Repository<KycDocument>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    private dataSource: DataSource,
    private emailService: EmailService,
    private configService: ConfigService,
  ) { }


  async uploadDocument(userId: string, file: Express.Multer.File, documentType: DocumentType) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads', 'kyc', userId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Check if document of this type already exists
    const existingDoc = await this.kycDocumentRepository.findOne({
      where: { userId, documentType },
    });

    if (existingDoc) {
      // Delete old file
      if (fs.existsSync(existingDoc.filePath)) {
        try {
          fs.unlinkSync(existingDoc.filePath);
        } catch (e) {
          console.error(`Failed to delete old file: ${existingDoc.filePath}`, e);
        }
      }
      // Delete old record
      await this.kycDocumentRepository.remove(existingDoc);
    }

    // Save new document
    const filePath = file.path;

    // Generate full URL using API_URL from environment
    const apiUrl = this.configService.get<string>('API_URL') || 'https://backendapi1-production.up.railway.app';
    const fileUrl = `${apiUrl}/uploads/kyc/${userId}/${file.filename}`;

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

  async submitKyc(userId: string) {
    // Check if user has uploaded at least one government ID
    const governmentDocs = await this.kycDocumentRepository.find({
      where: [
        { userId, documentType: DocumentType.PASSPORT },
        { userId, documentType: DocumentType.NATIONAL_ID },
        { userId, documentType: DocumentType.RESIDENCE_PERMIT },
      ],
    });

    if (governmentDocs.length === 0) {
      throw new BadRequestException('Please upload at least one government-issued ID before submitting KYC');
    }

    // Get user and profile
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if already submitted
    if (user.kycStatus === KycStatus.PENDING || user.kycStatus === KycStatus.APPROVED) {
      throw new BadRequestException(`KYC status is currently ${user.kycStatus}`);
    }

    // Update profile with submission timestamp
    await this.userProfileRepository.update(
      { userId },
      { kycSubmittedAt: new Date() }
    );

    // Update user KYC status to PENDING
    await this.userRepository.update(
      { id: userId },
      { kycStatus: KycStatus.PENDING }
    );

    // Send email notification
    try {
      await this.emailService.sendKycSubmittedNotification(user.email, user.firstName);
    } catch (error) {
      console.log('Failed to send KYC submission email:', error);
    }

    return {
      message: 'KYC submitted successfully. Your documents are under review.',
      status: KycStatus.PENDING,
    };
  }

  async submitFullKyc(userId: string, idFile: Express.Multer.File, selfieFile: Express.Multer.File | undefined, documentType: DocumentType) {
    if (!idFile) {
      throw new BadRequestException('Government ID file is required');
    }

    // Upload ID document
    await this.uploadDocument(userId, idFile, documentType);

    // Upload selfie if provided
    if (selfieFile) {
      await this.uploadDocument(userId, selfieFile, DocumentType.SELFIE);
    }

    // Submit for review
    return this.submitKyc(userId);
  }

  async getMyDocuments(userId: string) {
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

  async getKycStatus(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
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

  async getAllSubmissions(page = 1, limit = 20, filters?: KycFilterDto) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters?.status) {
      where.kycStatus = filters.status;
    } else {
      // By default, show only submitted KYC
      where.kycStatus = Not(KycStatus.NOT_SUBMITTED);
    }

    const [users, total] = await this.userRepository.findAndCount({
      where,
      relations: ['profile'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const submissions = await Promise.all(
      users.map(async (user) => {
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
          hasGovernmentId: documents.some(d => d.documentType !== DocumentType.SELFIE),
          hasSelfie: documents.some(d => d.documentType === DocumentType.SELFIE),
        };
      })
    );

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

  async getUserKyc(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
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

  async approveKyc(userId: string, adminId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.kycStatus === KycStatus.APPROVED) {
      throw new BadRequestException('KYC is already approved');
    }

    await this.dataSource.transaction(async (manager) => {
      // Update user KYC status
      await manager.update(User, { id: userId }, {
        kycStatus: KycStatus.APPROVED,
        isVerified: true,
      });

      // Get the documents to update profile
      const govDoc = await manager.findOne(KycDocument, {
        where: {
          userId,
          documentType: In([DocumentType.PASSPORT, DocumentType.NATIONAL_ID, DocumentType.RESIDENCE_PERMIT])
        },
        order: { uploadedAt: 'DESC' }
      });

      const selfieDoc = await manager.findOne(KycDocument, {
        where: { userId, documentType: DocumentType.SELFIE },
        order: { uploadedAt: 'DESC' }
      });

      // Update profile
      await manager.update(UserProfile, { userId }, {
        kycReviewedAt: new Date(),
        kycReviewedBy: adminId,
        kycRejectionReason: null,
        idType: govDoc?.documentType,
        idImageUrl: govDoc?.fileUrl,
        selfieUrl: selfieDoc?.fileUrl,
      });

      // Mark all documents as verified
      await manager.update(KycDocument, { userId }, {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: adminId,
      });
    });

    // Send approval email
    try {
      await this.emailService.sendKycApprovedNotification(user.email, user.firstName);
    } catch (error) {
      console.log('Failed to send KYC approval email:', error);
    }

    return {
      message: 'KYC approved successfully',
      userId,
      kycStatus: KycStatus.APPROVED,
    };
  }

  async rejectKyc(userId: string, adminId: string, rejectDto: RejectKycDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.dataSource.transaction(async (manager) => {
      // Update user KYC status
      await manager.update(User, { id: userId }, {
        kycStatus: KycStatus.REJECTED,
      });

      // Update profile
      await manager.update(UserProfile, { userId }, {
        kycReviewedAt: new Date(),
        kycReviewedBy: adminId,
        kycRejectionReason: rejectDto.reason,
      });

      // Reset documents isVerified status if needed (optional)
      await manager.update(KycDocument, { userId }, {
        isVerified: false,
      });
    });

    // Send rejection email
    try {
      await this.emailService.sendKycRejectedNotification(user.email, user.firstName, rejectDto.reason);
    } catch (error) {
      console.log('Failed to send KYC rejection email:', error);
    }

    return {
      message: 'KYC rejected',
      userId,
      kycStatus: KycStatus.REJECTED,
      reason: rejectDto.reason,
    };
  }
}
