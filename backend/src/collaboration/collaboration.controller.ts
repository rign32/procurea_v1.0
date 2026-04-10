import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  Logger,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';

class CreateCommentDto {
  entityType: string; // "campaign" | "supplier" | "rfq"
  entityId: string;
  content: string;
  mentions?: string[]; // Array of user IDs
}

@UseGuards(AuthGuard('jwt'))
@Controller('comments')
export class CollaborationController {
  private readonly logger = new Logger(CollaborationController.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /comments?entityType=campaign&entityId=xxx
   * List comments for a given entity.
   */
  @Get()
  async list(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
  ) {
    if (!entityType || !entityId) {
      throw new BadRequestException('entityType and entityId are required');
    }

    const allowedTypes = ['campaign', 'supplier', 'rfq'];
    if (!allowedTypes.includes(entityType)) {
      throw new BadRequestException(
        `entityType must be one of: ${allowedTypes.join(', ')}`,
      );
    }

    const comments = await this.prisma.comment.findMany({
      where: { entityType, entityId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return comments;
  }

  /**
   * POST /comments
   * Create a new comment.
   */
  @Post()
  async create(@Req() req: any, @Body() dto: CreateCommentDto) {
    const userId = req.user?.userId || req.user?.sub;

    if (!userId) {
      throw new ForbiddenException('Unauthorized');
    }

    if (!dto.entityType || !dto.entityId || !dto.content?.trim()) {
      throw new BadRequestException(
        'entityType, entityId, and content are required',
      );
    }

    const allowedTypes = ['campaign', 'supplier', 'rfq'];
    if (!allowedTypes.includes(dto.entityType)) {
      throw new BadRequestException(
        `entityType must be one of: ${allowedTypes.join(', ')}`,
      );
    }

    const comment = await this.prisma.comment.create({
      data: {
        userId,
        entityType: dto.entityType,
        entityId: dto.entityId,
        content: dto.content.trim(),
        mentions: dto.mentions ?? undefined,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    this.logger.log(
      `Comment created: ${comment.id} on ${dto.entityType}/${dto.entityId} by user ${userId}`,
    );

    return comment;
  }

  /**
   * DELETE /comments/:id
   * Delete own comment.
   */
  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.userId || req.user?.sub;

    if (!userId) {
      throw new ForbiddenException('Unauthorized');
    }

    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.delete({ where: { id } });

    this.logger.log(`Comment deleted: ${id} by user ${userId}`);

    return { deleted: true };
  }
}
