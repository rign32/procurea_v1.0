import { Controller, Get, Post, Param, Body, Req, NotFoundException, BadRequestException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PortalService } from './portal.service';
import { TranslationService } from '../common/services/translation.service';
import { UploadsService } from '../uploads/uploads.service';
import { SubmitOfferDto } from '../common/dto/submit-offer.dto';
import type { Request } from 'express';
import Busboy from 'busboy';

@Throttle({ default: { ttl: 60000, limit: 15 } }) // 15 per minute for entire portal
@Controller('portal')
export class PortalController {
    constructor(
        private readonly portalService: PortalService,
        private readonly translationService: TranslationService,
        private readonly uploadsService: UploadsService,
    ) {}

    @Get('offers/:accessToken')
    getOffer(@Param('accessToken') accessToken: string) {
        return this.portalService.getOfferByToken(accessToken);
    }

    @Post('offers/:accessToken/submit')
    submitOffer(
        @Param('accessToken') accessToken: string,
        @Body() body: SubmitOfferDto,
    ) {
        return this.portalService.submitOffer(accessToken, body);
    }

    @Post('offers/:accessToken/line-items')
    saveLineItems(
        @Param('accessToken') accessToken: string,
        @Body() body: { items: Array<{ rfqLineItemId: string; unitPrice?: number; currency?: string; moq?: number; leadTime?: number; altDescription?: string; altMaterial?: string; notes?: string }> },
    ) {
        return this.portalService.saveLineItemsForToken(accessToken, body.items ?? []);
    }

    @Post('offers/:accessToken/upload')
    @Throttle({ default: { ttl: 60000, limit: 10 } }) // 10 uploads per minute
    async uploadFile(
        @Param('accessToken') accessToken: string,
        @Req() req: Request,
    ) {
        // Validate access token exists and offer is in valid state
        await this.portalService.validateTokenForUpload(accessToken);

        // Parse multipart file
        const { file } = await this.parseMultipart(req);
        if (!file) throw new BadRequestException('No file provided');

        // Use existing uploads service to save file
        return this.uploadsService.saveFile(file);
    }

    @Post('offers/:accessToken/certificate')
    @Throttle({ default: { ttl: 60000, limit: 5 } })
    async uploadCertificate(
        @Param('accessToken') accessToken: string,
        @Req() req: Request,
    ) {
        // Expiry / state check before accepting the upload
        await this.portalService.validateTokenForUpload(accessToken);

        const { file, fields } = await this.parseMultipart(req);
        if (!file) throw new BadRequestException('No file provided');

        const required = ['type', 'code', 'validUntil'];
        for (const key of required) {
            if (!fields[key]) throw new BadRequestException(`Missing field: ${key}`);
        }

        return this.portalService.uploadCertificateForToken(accessToken, file, {
            type: fields.type,
            code: fields.code,
            validUntil: fields.validUntil,
            issuer: fields.issuer,
            certNumber: fields.certNumber,
            issuedAt: fields.issuedAt,
        });
    }

    @Get('branding/:orgId')
    async getOrganizationBranding(@Param('orgId') orgId: string) {
        return this.portalService.getOrganizationBranding(orgId);
    }

    @Get('translations/:langCode')
    async getTranslations(@Param('langCode') langCode: string) {
        // Validate language code (2-letter ISO code)
        if (!/^[a-z]{2}$/.test(langCode)) {
            throw new NotFoundException('Invalid language code');
        }

        return this.translationService.translatePortalUI(langCode);
    }

    /**
     * Parse multipart/form-data manually using busboy.
     * Returns the (optional) single file and a flat record of text fields.
     * Handles Cloud Functions pre-parsed body via req.rawBody.
     */
    private parseMultipart(req: Request): Promise<{
        file: { buffer: Buffer; originalname: string; mimetype: string; size: number } | null;
        fields: Record<string, string>;
    }> {
        return new Promise((resolve, reject) => {
            const busboy = Busboy({ headers: req.headers, limits: { fileSize: 10 * 1024 * 1024 } });
            const chunks: Buffer[] = [];
            const fields: Record<string, string> = {};
            let fileInfo: { filename: string; mimeType: string } | null = null;
            let limitReached = false;

            busboy.on('file', (_fieldname: string, file: NodeJS.ReadableStream & { truncated?: boolean }, info: { filename: string; mimeType: string }) => {
                fileInfo = info;
                file.on('data', (chunk: Buffer) => chunks.push(chunk));
                file.on('limit', () => { limitReached = true; });
            });

            busboy.on('field', (fieldname: string, value: string) => {
                fields[fieldname] = value;
            });

            busboy.on('finish', () => {
                if (limitReached) {
                    reject(new BadRequestException('File too large (max 10MB)'));
                    return;
                }
                if (!fileInfo) {
                    resolve({ file: null, fields });
                    return;
                }
                const buffer = Buffer.concat(chunks);
                resolve({
                    file: {
                        buffer,
                        originalname: fileInfo.filename,
                        mimetype: fileInfo.mimeType,
                        size: buffer.length,
                    },
                    fields,
                });
            });

            busboy.on('error', (err: Error) => reject(new BadRequestException(`Upload parse error: ${err.message}`)));

            const rawBody = (req as any).rawBody;
            if (rawBody) {
                busboy.end(rawBody);
            } else {
                req.pipe(busboy);
            }
        });
    }
}
