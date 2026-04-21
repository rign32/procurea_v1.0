import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CertificatesService } from './certificates.service';
import {
  CreateCertificateDto,
  UpdateCertificateDto,
} from './dto/certificate.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('suppliers/:supplierId/certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  private getUserId(req: any): string {
    return req.user?.userId || req.user?.sub;
  }

  @Get()
  async list(@Param('supplierId') supplierId: string, @Req() req: any) {
    await this.certificatesService.ensureSupplierAccess(supplierId, this.getUserId(req));
    const items = await this.certificatesService.list(supplierId);
    const summary = await this.certificatesService.summaryForSupplier(supplierId);
    return { items, summary };
  }

  @Post()
  async create(
    @Param('supplierId') supplierId: string,
    @Body() body: CreateCertificateDto,
    @Req() req: any,
  ) {
    await this.certificatesService.ensureSupplierAccess(supplierId, this.getUserId(req));
    return this.certificatesService.create(supplierId, body);
  }

  @Patch(':certificateId')
  async update(
    @Param('supplierId') supplierId: string,
    @Param('certificateId') certificateId: string,
    @Body() body: UpdateCertificateDto,
    @Req() req: any,
  ) {
    await this.certificatesService.ensureSupplierAccess(supplierId, this.getUserId(req));
    return this.certificatesService.update(certificateId, body);
  }

  @Delete(':certificateId')
  async remove(
    @Param('supplierId') supplierId: string,
    @Param('certificateId') certificateId: string,
    @Req() req: any,
  ) {
    await this.certificatesService.ensureSupplierAccess(supplierId, this.getUserId(req));
    await this.certificatesService.remove(certificateId);
    return { deleted: true };
  }
}
