import { Controller, Post, Get, Param, UseInterceptors, UploadedFile, UseGuards, Res, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { SkipThrottle } from '@nestjs/throttler';
import { UploadsService } from './uploads.service';
import type { Response } from 'express';

@Controller('uploads')
export class UploadsController {
    constructor(private readonly uploadsService: UploadsService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('file'))
    async upload(@UploadedFile() file: any) {
        return this.uploadsService.saveFile(file);
    }

    @Get(':storedFilename')
    @SkipThrottle()
    async download(
        @Param('storedFilename') storedFilename: string,
        @Res() res: Response,
    ) {
        // Validate filename format: UUID + allowed extension
        const filenameRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|dxf|step|stp|jpg|jpeg|png)$/i;
        if (!filenameRegex.test(storedFilename)) {
            throw new NotFoundException('Invalid filename');
        }

        const { buffer, contentType } = await this.uploadsService.downloadFile(storedFilename);

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="${storedFilename}"`);
        res.setHeader('Cache-Control', 'private, max-age=3600');
        res.send(buffer);
    }
}
