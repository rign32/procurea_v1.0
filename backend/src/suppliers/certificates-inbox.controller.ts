import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
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

    @Post('bulk-review')
    async bulkReview(
        @Body()
        body: {
            certificateIds: string[];
            action: 'APPROVE' | 'REJECT';
            notes?: string;
        },
        @Req() req: any,
    ) {
        if (!Array.isArray(body?.certificateIds)) {
            throw new BadRequestException('certificateIds must be an array');
        }
        if (body.action !== 'APPROVE' && body.action !== 'REJECT') {
            throw new BadRequestException('action must be APPROVE or REJECT');
        }
        return this.certificatesService.bulkReviewByTenant(
            this.getUserId(req),
            body.certificateIds,
            body.action,
            body.notes,
        );
    }
}
