import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: any): Promise<{
        profile: {
            id: string;
            country: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            dateOfBirth: Date | null;
            address: string | null;
            city: string | null;
            state: string | null;
            postalCode: string | null;
            occupation: string | null;
            idType: string | null;
            idNumber: string | null;
            idImageUrl: string | null;
            selfieUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phoneNumber: string;
        firstName: string;
        lastName: string;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
        isVerified: boolean;
        kycStatus: import(".prisma/client").$Enums.KycStatus;
    }>;
}
export {};
