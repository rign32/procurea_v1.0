import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CertificatesService } from './certificates.service';

/**
 * Tenant-wide review inbox for portal-uploaded certs.
 * Lives at /certificates/pending-review so it's not nested under a specific
 * supplier (it spans all suppliers the user can access).
 */
@UseGuards(AuthGuard('jwt'))
@Controller('certificates')
export class CertificatesInboxController {
    constructor(private readonly certificatesService: CertificatesService) {}

    private getUserId(req: any): string {
        return req.user?.userId || req.user?.sub;
    }

    @Get('pending-review')
    async listPending(@Req() req: any) {
        const items = await this.certificatesService.listPendingForReviewByTenant(
            this.getUserId(req),
        );
        return { items, count: items.length };
    }
}
