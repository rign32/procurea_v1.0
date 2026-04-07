import { Controller, Post, Get, Param, UseGuards, Req, Res, BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SkipThrottle } from '@nestjs/throttler';
import { UploadsService } from './uploads.service';
import type { Request, Response } from 'express';
import Busboy from 'busboy';

@Controller('uploads')
export class UploadsController {
    constructor(private readonly uploadsService: UploadsService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    async upload(@Req() req: Request) {
        const file = await this.parseMultipart(req);
        return this.uploadsService.saveFile(file);
    }

    @Get(':storedFilename')
    @SkipThrottle({ default: true })
    async download(
        @Param('storedFilename') storedFilename: string,
        @Res() res: Response,
    ) {
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

    /**
     * Parse multipart/form-data manually using busboy.
     * Cloud Functions pre-parses the request body, consuming the stream
     * before Multer can read it ("Unexpected end of form" error).
     * This method handles both Cloud Functions (req.rawBody) and regular Express (pipe).
     */
    private parseMultipart(req: Request): Promise<{ buffer: Buffer; originalname: string; mimetype: string; size: number }> {
        return new Promise((resolve, reject) => {
            const busboy = Busboy({ headers: req.headers, limits: { fileSize: 10 * 1024 * 1024 } });
            const chunks: Buffer[] = [];
            let fileInfo: { filename: string; mimeType: string } | null = null;
            let limitReached = false;

            busboy.on('file', (_fieldname: string, file: NodeJS.ReadableStream & { truncated?: boolean }, info: { filename: string; mimeType: string }) => {
                fileInfo = info;
                file.on('data', (chunk: Buffer) => chunks.push(chunk));
                file.on('limit', () => { limitReached = true; });
            });

            busboy.on('finish', () => {
                if (limitReached) {
                    reject(new BadRequestException('File too large (max 10MB)'));
                    return;
                }
                if (!fileInfo) {
                    reject(new BadRequestException('No file provided'));
                    return;
                }
                const buffer = Buffer.concat(chunks);
                resolve({
                    buffer,
                    originalname: fileInfo.filename,
                    mimetype: fileInfo.mimeType,
                    size: buffer.length,
                });
            });

            busboy.on('error', (err: Error) => reject(new BadRequestException(`Upload parse error: ${err.message}`)));

            // Cloud Functions pre-parses body — rawBody contains the original bytes
            const rawBody = (req as any).rawBody;
            if (rawBody) {
                busboy.end(rawBody);
            } else {
                req.pipe(busboy);
            }
        });
    }
}
