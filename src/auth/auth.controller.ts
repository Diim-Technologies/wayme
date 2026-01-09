import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
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
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user account',
    description: 'Create a new user account with email verification. Users must verify their email before they can make transfers.'
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    example: {
      id: 'user_123',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isEmailVerified: false,
      kycStatus: 'PENDING',
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
  })
  @ApiResponse({ status: 409, description: 'Email or phone number already registered' })
  @ApiResponse({ status: 400, description: 'Invalid registration data or weak password' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login with email and password',
    description: 'Authenticate user with email/password and return JWT token for accessing protected endpoints.'
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    example: {
      user: {
        id: 'user_123',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        isEmailVerified: true,
        kycStatus: 'APPROVED'
      },
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      tokenType: 'Bearer',
      expiresIn: 3600
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  @ApiResponse({ status: 423, description: 'Account is locked or suspended' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Request password reset OTP via email',
    description: 'Send a password reset OTP to the user\'s email address. OTP expires after 10 minutes. For security, this endpoint always returns success even if email doesn\'t exist.'
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset OTP sent to email if account exists',
    example: {
      message: 'If an account with this email exists, you will receive a password reset code shortly.',
      otpSent: true
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid email format' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('verify-otp')
  @ApiOperation({
    summary: 'Verify password reset OTP',
    description: 'Verify the OTP sent to the user\'s email for password reset. Returns a temporary token for password reset.'
  })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
    example: {
      message: 'OTP verified successfully',
      resetToken: 'temp_reset_token_xyz123',
      expiresIn: 600
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid, expired, or already used OTP' })
  @ApiResponse({ status: 404, description: 'User not found or OTP not found' })
  async verifyOTP(@Body() verifyOTPDto: VerifyOTPDto) {
    return this.authService.verifyOTP(verifyOTPDto);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password using verified OTP',
    description: 'Reset the user password using the OTP and temporary reset token from the verify-otp endpoint.'
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    example: {
      message: 'Password reset successfully',
      passwordChanged: true
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token, or weak password' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Change password for authenticated users',
    description: 'Change password for logged-in users. Requires current password for security verification.'
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    example: {
      message: 'Password changed successfully',
      passwordChanged: true
    }
  })
  @ApiResponse({ status: 400, description: 'Current password is incorrect or new password is weak' })
  @ApiResponse({ status: 401, description: 'Invalid or expired JWT token' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Post('request-email-verification')
  @ApiOperation({
    summary: 'Request email verification OTP',
    description: 'Send a verification code to the user\'s email address to verify email ownership. OTP expires after 10 minutes.'
  })
  @ApiResponse({
    status: 200,
    description: 'Verification code sent successfully',
    example: {
      message: 'Verification code sent to your email address.',
      otpSent: true
    }
  })
  @ApiResponse({ status: 400, description: 'Email is already verified' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async requestEmailVerification(@Body() requestDto: RequestEmailVerificationDto) {
    return this.authService.requestEmailVerificationOTP(requestDto);
  }

  @Post('verify-email')
  @ApiOperation({
    summary: 'Verify email with OTP code',
    description: 'Verify the user\'s email address using the OTP code sent via email. Marks the user as verified upon success.'
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    example: {
      message: 'Email verified successfully.',
      verified: true
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid, expired, or already used OTP code, or email already verified' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmailOTP(verifyEmailDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current authenticated user profile',
    description: 'Retrieve the profile information for the currently logged-in user including KYC status and email verification status.'
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    example: {
      id: 'user_123',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+2348123456789',
      role: 'USER',
      isEmailVerified: true,
      kycStatus: 'APPROVED',
      createdAt: '2024-11-14T10:00:00Z',
      lastLoginAt: '2024-11-14T12:30:00Z'
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired JWT token' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProfile(@Request() req) {
    return this.authService.validateUser(req.user.id);
  }
}