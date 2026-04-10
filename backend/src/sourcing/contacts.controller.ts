import { Controller, Get, Post, Patch, Delete, Query, Body, Param, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/services/tenant-context.service';
import { IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator';

class CreateContactDto {
  @IsString()
  supplierId: string;

  @IsString()
  name: string;

  @IsOptional() @IsString()
  role?: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsBoolean()
  isDecisionMaker?: boolean;

  @IsOptional() @IsString()
  linkedinUrl?: string;

  @IsOptional() @IsString()
  department?: string;

  @IsOptional() @IsString()
  seniority?: string;
}

class UpdateContactDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  role?: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsBoolean()
  isDecisionMaker?: boolean;

  @IsOptional() @IsString()
  linkedinUrl?: string;

  @IsOptional() @IsString()
  department?: string;

  @IsOptional() @IsString()
  seniority?: string;
}

@UseGuards(AuthGuard('jwt'))
@Controller('contacts')
export class ContactsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

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

  @Post()
  async createContact(@Req() req: any, @Body() dto: CreateContactDto) {
    const userId = req.user?.userId || req.user?.sub;
    const tenant = await this.tenantContext.resolve(userId);

    // Verify supplier belongs to user's campaign (via TenantContext)
    const supplier = await this.prisma.supplier.findFirst({
      where: {
        id: dto.supplierId,
        deletedAt: null,
        campaign: { deletedAt: null, rfqRequest: tenant.campaignOwnerFilter() },
      },
    });
    if (!supplier) {
      throw new HttpException('Supplier not found or not yours', HttpStatus.NOT_FOUND);
    }

    return this.prisma.contact.create({
      data: {
        supplierId: dto.supplierId,
        name: dto.name,
        role: dto.role,
        email: dto.email,
        phone: dto.phone,
        isDecisionMaker: dto.isDecisionMaker ?? false,
        linkedinUrl: dto.linkedinUrl,
        department: dto.department,
        seniority: dto.seniority,
      },
    });
  }

  @Patch(':id')
  async updateContact(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateContactDto) {
    const userId = req.user?.userId || req.user?.sub;
    const tenant = await this.tenantContext.resolve(userId);

    const contact = await this.prisma.contact.findFirst({
      where: {
        id,
        supplier: {
          deletedAt: null,
          campaign: { deletedAt: null, rfqRequest: tenant.campaignOwnerFilter() },
        },
      },
    });
    if (!contact) {
      throw new HttpException('Contact not found', HttpStatus.NOT_FOUND);
    }

    return this.prisma.contact.update({
      where: { id },
      data: dto,
    });
  }

  @Delete(':id')
  async deleteContact(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.userId || req.user?.sub;
    const tenant = await this.tenantContext.resolve(userId);

    const contact = await this.prisma.contact.findFirst({
      where: {
        id,
        supplier: {
          deletedAt: null,
          campaign: { deletedAt: null, rfqRequest: tenant.campaignOwnerFilter() },
        },
      },
    });
    if (!contact) {
      throw new HttpException('Contact not found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.contact.delete({ where: { id } });
    return { success: true };
  }
}
