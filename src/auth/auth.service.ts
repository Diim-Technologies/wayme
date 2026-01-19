import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, OTP } from '../entities';
import { OTPType } from '../enums/common.enum';
import { EmailService } from '../common/services/email.service';
import * as bcrypt from 'bcrypt';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  VerifyOTPDto,
  ResetPasswordDto,
  ChangePasswordDto,
  RequestEmailVerificationDto,
  VerifyEmailDto
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(OTP)
    private otpRepository: Repository<OTP>,
    private dataSource: DataSource,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) { }

  async register(registerDto: RegisterDto) {
    const { email, firstName, lastName, phoneNumber, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email already registered');
      }
      throw new ConflictException('Phone number already registered');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = this.userRepository.create({
      email,
      firstName,
      lastName,
      phoneNumber,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate JWT token
    const payload = { sub: savedUser.id, email: savedUser.email, role: savedUser.role };
    const accessToken = this.jwtService.sign(payload);

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(email, firstName);
    } catch (error) {
      console.log('Failed to send welcome email:', error);
    }

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        phoneNumber: savedUser.phoneNumber,
        role: savedUser.role,
        isVerified: savedUser.isVerified,
        kycStatus: savedUser.kycStatus,
        createdAt: savedUser.createdAt,
      },
      accessToken,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if 2FA is enabled
    if (user.isTwoFactorEnabled) {
      // Generate 6-digit OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save OTP to database
      const otpEntity = this.otpRepository.create({
        userId: user.id,
        code: otp,
        type: OTPType.TWO_FACTOR_AUTH,
        expiresAt,
      });
      await this.otpRepository.save(otpEntity);

      // Send OTP via email
      try {
        await this.emailService.sendLogin2FAOTP(email, otp, user.firstName);
      } catch (error) {
        console.log('Failed to send 2FA OTP:', error);
      }

      return {
        message: '2FA_REQUIRED',
        email: user.email,
        twoFactorEnabled: true,
      };
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.isVerified,
        kycStatus: user.kycStatus,
        createdAt: user.createdAt,
      },
      accessToken,
    };
  }

  async verify2FA(verify2FADto: any) {
    const { email, code } = verify2FADto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find valid OTP
    const otp = await this.otpRepository.findOne({
      where: {
        userId: user.id,
        code,
        type: OTPType.TWO_FACTOR_AUTH,
        isUsed: false,
      },
    });

    if (!otp || otp.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired 2FA code');
    }

    // Mark OTP as used
    await this.otpRepository.update({ id: otp.id }, { isUsed: true });

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.isVerified,
        kycStatus: user.kycStatus,
        createdAt: user.createdAt,
      },
      accessToken,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return {
        message: 'If the email exists in our system, you will receive a password reset code.',
      };
    }

    // Generate 6-digit OTP
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    const otpEntity = this.otpRepository.create({
      userId: user.id,
      code: otp,
      type: OTPType.PASSWORD_RESET,
      expiresAt,
    });
    await this.otpRepository.save(otpEntity);

    // Send OTP via email
    try {
      await this.emailService.sendPasswordResetOTP(email, otp, user.firstName);
    } catch (error) {
      console.log('Failed to send password reset OTP:', error);
      throw new BadRequestException('Failed to send password reset email. Please try again.');
    }

    return {
      message: 'If the email exists in our system, you will receive a password reset code.',
    };
  }

  async verifyOTP(verifyOTPDto: VerifyOTPDto) {
    const { email, code } = verifyOTPDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find valid OTP
    const otp = await this.otpRepository.findOne({
      where: {
        userId: user.id,
        code,
        type: OTPType.PASSWORD_RESET,
        isUsed: false,
      },
    });

    if (!otp || otp.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired OTP code');
    }

    return {
      message: 'OTP verified successfully. You can now reset your password.',
      verified: true,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, code, newPassword } = resetPasswordDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find and validate OTP
    const otp = await this.otpRepository.findOne({
      where: {
        userId: user.id,
        code,
        type: OTPType.PASSWORD_RESET,
        isUsed: false,
      },
    });

    if (!otp || otp.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired OTP code');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password and mark OTP as used in a transaction
    await this.dataSource.transaction(async (manager) => {
      await manager.update(User, { id: user.id }, { password: hashedPassword });
      await manager.update(OTP, { id: otp.id }, { isUsed: true });
    });

    // Send password change confirmation email
    try {
      await this.emailService.sendPasswordChangeConfirmation(email, user.firstName);
    } catch (error) {
      console.log('Failed to send password change confirmation:', error);
    }

    return {
      message: 'Password reset successfully. You can now login with your new password.',
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    // Find user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await this.userRepository.update({ id: userId }, { password: hashedPassword });

    // Send password change confirmation email
    try {
      await this.emailService.sendPasswordChangeConfirmation(user.email, user.firstName);
    } catch (error) {
      console.log('Failed to send password change confirmation:', error);
    }

    return {
      message: 'Password changed successfully.',
    };
  }

  async validateUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        isVerified: true,
        kycStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async requestEmailVerificationOTP(requestDto: RequestEmailVerificationDto) {
    const { email } = requestDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if already verified
    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate 6-digit OTP
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    const otpEntity = this.otpRepository.create({
      userId: user.id,
      code: otp,
      type: OTPType.EMAIL_VERIFICATION,
      expiresAt,
    });
    await this.otpRepository.save(otpEntity);

    // Send OTP via email
    try {
      await this.emailService.sendEmailVerificationOTP(email, otp, user.firstName);
    } catch (error) {
      console.log('Failed to send email verification OTP:', error);
      throw new BadRequestException('Failed to send verification email. Please try again.');
    }

    return {
      message: 'Verification code sent to your email address.',
      otpSent: true,
    };
  }

  async verifyEmailOTP(verifyEmailDto: VerifyEmailDto) {
    const { email, code } = verifyEmailDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if already verified
    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Find valid OTP
    const otp = await this.otpRepository.findOne({
      where: {
        userId: user.id,
        code,
        type: OTPType.EMAIL_VERIFICATION,
        isUsed: false,
      },
    });

    if (!otp || otp.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification code');
    }


    // Update user verification status and mark OTP as used in a transaction
    await this.dataSource.transaction(async (manager) => {
      await manager.update(User, { id: user.id }, { isVerified: true, isEmailVerified: true });
      await manager.update(OTP, { id: otp.id }, { isUsed: true });
    });

    return {
      message: 'Email verified successfully.',
      verified: true,
    };
  }

  async cleanupExpiredOTPs() {
    // Clean up expired OTPs (run this periodically)
    await this.otpRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }
}