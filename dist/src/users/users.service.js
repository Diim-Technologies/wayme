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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
let UsersService = class UsersService {
    constructor(userRepository, userProfileRepository) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
    }
    async findById(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                isVerified: true,
                isEmailVerified: true,
                kycStatus: true,
                createdAt: true,
                updatedAt: true,
            },
            relations: ['profile'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateProfile(userId, updateProfileDto) {
        const queryRunner = this.userRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const { email, firstName, lastName, phoneNumber, ...profileData } = updateProfileDto;
            const userUpdates = {};
            if (email)
                userUpdates.email = email;
            if (firstName)
                userUpdates.firstName = firstName;
            if (lastName)
                userUpdates.lastName = lastName;
            if (phoneNumber)
                userUpdates.phoneNumber = phoneNumber;
            if (Object.keys(userUpdates).length > 0) {
                await queryRunner.manager.update(entities_1.User, userId, userUpdates);
            }
            let profile = await this.userProfileRepository.findOne({
                where: { userId },
            });
            if (profile) {
                await queryRunner.manager.update(entities_1.UserProfile, { userId }, profileData);
            }
            else {
                const newProfile = this.userProfileRepository.create({
                    userId,
                    ...profileData,
                });
                await queryRunner.manager.save(entities_1.UserProfile, newProfile);
            }
            await queryRunner.commitTransaction();
            const updatedProfile = await this.userProfileRepository.findOne({
                where: { userId },
                relations: ['user'],
            });
            if (!updatedProfile) {
                return {
                    message: 'Profile Not updated successfully',
                };
            }
            return {
                message: 'Profile updated successfully',
                ...updatedProfile,
                user: {
                    id: updatedProfile.user.id,
                    email: updatedProfile.user.email,
                    firstName: updatedProfile.user.firstName,
                    lastName: updatedProfile.user.lastName,
                    phoneNumber: updatedProfile.user.phoneNumber,
                    isVerified: updatedProfile.user.isVerified,
                    kycStatus: updatedProfile.user.kycStatus,
                },
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            if (error.code === '23505') {
                throw new common_1.ConflictException('Email or phone number already in use');
            }
            if (error.status) {
                throw error;
            }
            console.error('Error updating profile:', error);
            throw new common_1.InternalServerErrorException('Failed to update profile');
        }
        finally {
            await queryRunner.release();
        }
    }
    async getProfile(userId) {
        const profile = await this.userProfileRepository.findOne({
            where: { userId },
            relations: ['user'],
        });
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        return {
            ...profile,
            user: {
                id: profile.user.id,
                email: profile.user.email,
                firstName: profile.user.firstName,
                lastName: profile.user.lastName,
                phoneNumber: profile.user.phoneNumber,
                isVerified: profile.user.isVerified,
                kycStatus: profile.user.kycStatus,
                isEmailVerified: profile.user.isEmailVerified,
            },
        };
    }
    async getTransferHistory(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [transfers, total] = await Promise.all([
            this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.sentTransfers', 'sentTransfer')
                .leftJoinAndSelect('user.receivedTransfers', 'receivedTransfer')
                .leftJoinAndSelect('sentTransfer.receiver', 'sentReceiver')
                .leftJoinAndSelect('sentTransfer.recipientBank', 'sentRecipientBank')
                .leftJoinAndSelect('receivedTransfer.sender', 'receivedSender')
                .leftJoinAndSelect('receivedTransfer.recipientBank', 'receivedRecipientBank')
                .where('user.id = :userId', { userId })
                .orderBy('COALESCE(sentTransfer.createdAt, receivedTransfer.createdAt)', 'DESC')
                .skip(skip)
                .take(limit)
                .getMany()
                .then(users => {
                const user = users[0];
                if (!user)
                    return [];
                const allTransfers = [
                    ...user.sentTransfers.map(t => ({ ...t, type: 'sent' })),
                    ...user.receivedTransfers.map(t => ({ ...t, type: 'received' }))
                ];
                return allTransfers
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, limit);
            }),
            this.userRepository
                .createQueryBuilder('user')
                .leftJoin('user.sentTransfers', 'sentTransfer')
                .leftJoin('user.receivedTransfers', 'receivedTransfer')
                .where('user.id = :userId', { userId })
                .getCount()
        ]);
        return {
            transfers,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit,
            },
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.UserProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map