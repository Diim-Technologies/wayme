import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserProfile, Transfer } from '../entities';
import { UpdateProfileDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
  ) { }

  async findById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        isVerified: true,
        kycStatus: true,
        createdAt: true,
        updatedAt: true,
      },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const queryRunner = this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if user exists
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const { email, firstName, lastName, phoneNumber, ...profileData } = updateProfileDto;
      const userUpdates: Partial<User> = {};

      if (email) userUpdates.email = email;
      if (firstName) userUpdates.firstName = firstName;
      if (lastName) userUpdates.lastName = lastName;
      if (phoneNumber) userUpdates.phoneNumber = phoneNumber;

      // Update user if there are user-related changes
      if (Object.keys(userUpdates).length > 0) {
        await queryRunner.manager.update(User, userId, userUpdates);
      }

      // Check if profile exists
      let profile = await this.userProfileRepository.findOne({
        where: { userId },
      });

      if (profile) {
        // Update existing profile
        await queryRunner.manager.update(UserProfile, { userId }, profileData);
      } else {
        // Create new profile
        const newProfile = this.userProfileRepository.create({
          userId,
          ...profileData,
        });
        await queryRunner.manager.save(UserProfile, newProfile);
      }

      await queryRunner.commitTransaction();

      // Return updated profile with user data
      const updatedProfile = await this.userProfileRepository.findOne({
        where: { userId },
        relations: ['user'],
      });

      if (!updatedProfile) {
        // Fallback if profile was just created but something went wrong or if we need to return something valid even if profile finding fails (though commit happened)
        return {
          ...profileData,
          userId,
          user: {
            ...user,
            ...userUpdates
          }
        }
      }

      return {
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

    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error.code === '23505') { // Postgres unique violation code
        throw new ConflictException('Email or phone number already in use');
      }

      // Check if it's already an HttpException
      if (error.status) {
        throw error;
      }

      console.error('Error updating profile:', error);
      throw new InternalServerErrorException('Failed to update profile');
    } finally {
      await queryRunner.release();
    }
  }

  async getProfile(userId: string) {
    const profile = await this.userProfileRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
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
      },
    };
  }

  async getTransferHistory(userId: string, page = 1, limit = 10) {
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
          if (!user) return [];

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
}