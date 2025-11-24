import { Controller, Get, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get user notifications with pagination',
    description: 'Retrieve paginated notifications for the authenticated user including transfer updates, system messages, and important alerts.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Notifications retrieved successfully',
    example: {
      notifications: [
        {
          id: 'notif_123',
          title: 'Transfer Completed',
          message: 'Your transfer to Jane Doe has been completed successfully',
          type: 'TRANSFER_COMPLETED',
          isRead: false,
          createdAt: '2024-11-14T10:30:00Z',
          metadata: {
            transferId: 'transfer_456',
            amount: 100.00
          }
        }
      ],
      pagination: {
        currentPage: 1,
        totalPages: 3,
        totalItems: 25,
        itemsPerPage: 20
      }
    }
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    example: 1,
    description: 'Page number for pagination (default: 1)'
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    example: 20,
    description: 'Number of notifications per page (default: 20, max: 100)'
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired JWT token' })
  async getNotifications(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.notificationsService.getUserNotifications(
      req.user.id,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Get('unread-count')
  @ApiOperation({ 
    summary: 'Get unread notifications count',
    description: 'Get the total count of unread notifications for the authenticated user. Useful for badge displays in UI.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Unread count retrieved successfully',
    example: {
      unreadCount: 5,
      lastChecked: '2024-11-14T12:00:00Z'
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired JWT token' })
  async getUnreadCount(@Request() req) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ 
    summary: 'Mark specific notification as read',
    description: 'Mark a specific notification as read by its ID. This updates the notification status and reduces the unread count.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Notification ID', 
    example: 'notif_123' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Notification marked as read successfully',
    example: {
      message: 'Notification marked as read',
      notificationId: 'notif_123',
      isRead: true,
      readAt: '2024-11-14T15:30:00Z'
    }
  })
  @ApiResponse({ status: 404, description: 'Notification not found or does not belong to user' })
  @ApiResponse({ status: 401, description: 'Invalid or expired JWT token' })
  async markAsRead(@Request() req, @Param('id') id: string) {
    return this.notificationsService.markNotificationAsRead(req.user.id, id);
  }

  @Patch('mark-all-read')
  @ApiOperation({ 
    summary: 'Mark all notifications as read',
    description: 'Mark all notifications for the authenticated user as read. This is useful for "Mark all as read" functionality in UI.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'All notifications marked as read successfully',
    example: {
      message: 'All notifications marked as read',
      markedCount: 15,
      timestamp: '2024-11-14T15:30:00Z'
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired JWT token' })
  async markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }
}