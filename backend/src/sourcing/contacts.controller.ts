import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(AuthGuard('jwt'))
@Controller('contacts')
export class ContactsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getAllContacts(
    @Req() req: any,
    @Query('campaignId') campaignId?: string,
    @Query('emailStatus') emailStatus?: string,
    @Query('search') search?: string,
  ) {
    const userId = req.user?.userId || req.user?.sub;

    // Build where clause — only contacts from user's campaigns
    const where: any = {
      supplier: {
        deletedAt: null,
        campaign: {
          deletedAt: null,
        },
      },
    };

    if (campaignId) {
      where.supplier.campaignId = campaignId;
    }

    if (emailStatus) {
      where.emailStatus = emailStatus;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { supplier: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const contacts = await this.prisma.contact.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            website: true,
            campaign: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return contacts;
  }
}
