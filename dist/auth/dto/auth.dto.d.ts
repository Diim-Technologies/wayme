export declare class RegisterDto {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    password: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class VerifyOTPDto {
    email: string;
    code: string;
}
export declare class ResetPasswordDto {
    email: string;
    code: string;
    newPassword: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
