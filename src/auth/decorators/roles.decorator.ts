import { SetMetadata } from '@nestjs/common';

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);