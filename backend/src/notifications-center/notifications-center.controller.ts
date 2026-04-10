import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Req,
  UseGuards,
  Logger,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsCenterController {
  private readonly logger = new Logger(NotificationsCenterController.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /notifications?unreadOnly=true
   * List notifications for the authenticated user.
   */
  @Get()
  async list(
    @Req() req: any,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) throw new ForbiddenException('Unauthorized');

    const where: any = { userId };
    if (unreadOnly === 'true') {
      where.read = false;
    }

    const notifications = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return notifications;
  }

  /**
   * GET /notifications/unread-count
   * Return count of unread notifications for the authenticated user.
   */
  @Get('unread-count')
  async unreadCount(@Req() req: any) {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) throw new ForbiddenException('Unauthorized');

    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });

    return { count };
  }

  /**
   * PATCH /notifications/:id/read
   * Mark a single notification as read.
   */
  @Patch(':id/read')
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) throw new ForbiddenException('Unauthorized');

    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.userId !== userId) throw new ForbiddenException('Not your notification');

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return updated;
  }

  /**
   * POST /notifications/mark-all-read
   * Mark all notifications as read for the authenticated user.
   */
  @Post('mark-all-read')
  async markAllRead(@Req() req: any) {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) throw new ForbiddenException('Unauthorized');

    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    this.logger.log(`Marked ${result.count} notifications as read for user ${userId}`);

    return { updated: result.count };
  }
}
