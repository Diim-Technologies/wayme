import { NotificationType } from '../enums/common.enum';
import { User } from './user.entity';
export declare class Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    data: any;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
