import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as admin from 'firebase-admin';
import * as path from 'path';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXT = ['.pdf', '.dxf', '.step', '.stp', '.jpg', '.jpeg', '.png'];

@Injectable()
export class UploadsService {
    private readonly logger = new Logger(UploadsService.name);
    private readonly bucket: any;
    private readonly isCloudStorageEnabled: boolean;

    constructor() {
        const bucketName = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

        // Ensure firebase-admin is initialized (usually done in main.ts or a core module)
        if (admin.apps.length > 0 && bucketName) {
            this.logger.log(`Initializing Firebase Storage for bucket: ${bucketName}`);
            this.bucket = admin.storage().bucket(bucketName);
            this.isCloudStorageEnabled = true;
        } else {
            this.logger.warn('Firebase Admin not initialized or FIREBASE_STORAGE_BUCKET not set. Falling back to mocked local URLs.');
            this.isCloudStorageEnabled = false;
        }
    }

    async saveFile(file: any) {
        if (!file) throw new BadRequestException('No file provided');
        if (file.size > MAX_SIZE) throw new BadRequestException('File too large (max 10MB)');

        const ext = path.extname(file.originalname).toLowerCase();
        if (!ALLOWED_EXT.includes(ext)) {
            throw new BadRequestException(`File type not allowed. Allowed: ${ALLOWED_EXT.join(', ')}`);
        }

        const id = randomUUID();
        const filename = `${id}${ext}`;
        const objectKey = `uploads/${filename}`;

        if (this.isCloudStorageEnabled) {
            try {
                const fileRef = this.bucket.file(objectKey);

                await fileRef.save(file.buffer, {
                    metadata: {
                        contentType: file.mimetype,
                    },
                });

                this.logger.log(`Uploaded ${filename} to Firebase Storage (${file.size} bytes)`);

                return {
                    id,
                    filename: file.originalname,
                    storedFilename: filename,
                    url: `/api/uploads/${filename}`,
                    size: file.size,
                    mimeType: file.mimetype,
                };
            } catch (error: any) {
                this.logger.error(`Failed to upload to Firebase Storage: ${error.message}`);
                throw new BadRequestException('Błąd podczas zapisywania pliku w chmurze.');
            }
        } else {
            // Stub for local development without Firebase Storage
            return {
                id,
                filename: file.originalname,
                storedFilename: filename,
                url: `/api/uploads/${filename}`,
                size: file.size,
                mimeType: file.mimetype,
            };
        }
    }

    async downloadFile(storedFilename: string): Promise<{ buffer: Buffer; contentType: string }> {
        const sanitized = path.basename(storedFilename);
        const objectKey = `uploads/${sanitized}`;

        if (!this.isCloudStorageEnabled) {
            throw new NotFoundException('Cloud Storage not configured');
        }

        try {
            const fileRef = this.bucket.file(objectKey);
            const [exists] = await fileRef.exists();
            if (!exists) {
                throw new NotFoundException('File not found in storage');
            }

            const [buffer] = await fileRef.download();
            const [metadata] = await fileRef.getMetadata();
            const contentType = metadata.contentType || 'application/octet-stream';

            return { buffer, contentType };
        } catch (error: any) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error(`Failed to download from Firebase Storage: ${error.message}`);
            throw new NotFoundException('File not found');
        }
    }
}
