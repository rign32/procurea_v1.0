import { Controller, Get, Post, Param, Body, Res, NotFoundException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { PortalService } from './portal.service';
import { TranslationService } from '../common/services/translation.service';
import { SubmitOfferDto } from '../common/dto/submit-offer.dto';
import * as path from 'path';
import * as fs from 'fs';

@Throttle({ default: { ttl: 60000, limit: 15 } }) // 15 per minute for entire portal
@Controller('portal')
export class PortalController {
    constructor(
        private readonly portalService: PortalService,
        private readonly translationService: TranslationService,
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

    @Get('translations/:langCode')
    async getTranslations(@Param('langCode') langCode: string) {
        // Validate language code (2-letter ISO code)
        if (!/^[a-z]{2}$/.test(langCode)) {
            throw new NotFoundException('Invalid language code');
        }

        return this.translationService.translatePortalUI(langCode);
    }

    @Get('attachments/:filename')
    getAttachment(@Param('filename') filename: string, @Res() res: Response) {
        // Sanitize filename to prevent path traversal
        const sanitized = path.basename(filename);
        const filepath = path.join(process.cwd(), 'uploads', sanitized);

        if (!fs.existsSync(filepath)) {
            throw new NotFoundException('File not found');
        }

        res.sendFile(filepath);
    }
}
