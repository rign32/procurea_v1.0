import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';
import { SlackNotificationsService } from '../sales-ops/slack-notifications.service';

class CreateFeedbackDto {
  type: string; // "bug" | "feature" | "other"
  message: string;
  page?: string;
}

@UseGuards(AuthGuard('jwt'))
@Controller('feedback')
export class FeedbackController {
  private readonly logger = new Logger(FeedbackController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly slack: SlackNotificationsService,
  ) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateFeedbackDto) {
    const userId = req.user?.userId || req.user?.sub;

    if (!userId) {
      return { error: 'Unauthorized' };
    }

    if (!dto.type || !dto.message) {
      return { error: 'Type and message are required' };
    }

    // Fetch user info for Slack notification
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    const feedback = await this.prisma.feedback.create({
      data: {
        userId,
        type: dto.type,
        message: dto.message,
        page: dto.page || null,
      },
    });

    this.logger.log(
      `Feedback created: ${feedback.id} (${dto.type}) by ${user?.email}`,
    );

    // Send Slack notification (fire-and-forget)
    const typeLabels: Record<string, string> = {
      bug: 'Bug',
      feature: 'Feature Request',
      other: 'Other',
    };

    const typeIcons: Record<string, string> = {
      bug: '🐛',
      feature: '💡',
      other: '📝',
    };

    this.slack
      .sendAlert({
        icon: typeIcons[dto.type] || '📝',
        title: `In-app Feedback — ${typeLabels[dto.type] || dto.type}`,
        fields: [
          { label: 'User', value: user?.name || user?.email || userId },
          { label: 'Email', value: user?.email || 'N/A' },
          { label: 'Message', value: dto.message.substring(0, 500) },
          ...(dto.page ? [{ label: 'Page', value: dto.page }] : []),
        ],
      })
      .catch((err) => {
        this.logger.warn(`Slack notification failed: ${err.message}`);
      });

    return { id: feedback.id, status: 'ok' };
  }
}
