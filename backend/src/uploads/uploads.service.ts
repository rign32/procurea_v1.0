import { Injectable, BadRequestException, Logger } from '@nestjs/common';
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

                // Generate a read-only presigned URL valid for 7 days
                const [signedUrl] = await fileRef.getSignedUrl({
                    action: 'read',
                    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
                });

                return {
                    id,
                    filename: file.originalname,
                    storedFilename: filename,
                    url: signedUrl,
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
                url: `/mock-uploads/${filename}`,
                size: file.size,
                mimeType: file.mimetype,
            };
        }
    }
}
