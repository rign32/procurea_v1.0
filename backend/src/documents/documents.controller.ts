import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Req,
  UseGuards,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SkipThrottle } from '@nestjs/throttler';
import { DocumentsService } from './documents.service';
import Busboy from 'busboy';
import type { Request } from 'express';

@UseGuards(AuthGuard('jwt'))
@Controller('documents')
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);

  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * GET /documents?entityType=&entityId=&category=&tag=&search=&page=
   */
  @Get()
  async list(
    @Req() req: any,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user?.userId || req.user?.sub;
    const organizationId = req.user?.organizationId;

    return this.documentsService.list({
      userId,
      organizationId,
      entityType,
      entityId,
      category,
      tag,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  /**
   * POST /documents — upload a new document (multipart form data)
   * Expects multipart with file field "file" and optional text fields:
   * category, tags (comma-separated), description, entityType, entityId
   */
  @Post()
  @SkipThrottle({ default: true })
  async upload(@Req() req: Request & { user?: any }) {
    const userId = req.user?.userId || req.user?.sub;
    const organizationId = req.user?.organizationId;

    if (!userId) {
      throw new BadRequestException('Unauthorized');
    }

    const parsed = await this.parseMultipartWithFields(req);

    if (!parsed.file) {
      throw new BadRequestException('No file provided');
    }

    const tags = parsed.fields.tags
      ? parsed.fields.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : undefined;

    return this.documentsService.upload({
      userId,
      organizationId,
      file: parsed.file,
      category: parsed.fields.category || undefined,
      tags,
      description: parsed.fields.description || undefined,
      entityType: parsed.fields.entityType || undefined,
      entityId: parsed.fields.entityId || undefined,
    });
  }

  /**
   * POST /documents/:id/new-version — upload a new version
   */
  @Post(':id/new-version')
  @SkipThrottle({ default: true })
  async uploadNewVersion(
    @Req() req: Request & { user?: any },
    @Param('id') id: string,
  ) {
    const userId = req.user?.userId || req.user?.sub;
    const organizationId = req.user?.organizationId;

    if (!userId) {
      throw new BadRequestException('Unauthorized');
    }

    const parsed = await this.parseMultipartWithFields(req);

    if (!parsed.file) {
      throw new BadRequestException('No file provided');
    }

    return this.documentsService.uploadNewVersion({
      documentId: id,
      userId,
      organizationId,
      file: parsed.file,
    });
  }

  /**
   * PATCH /documents/:id — update metadata
   */
  @Patch(':id')
  async updateMetadata(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const userId = req.user?.userId || req.user?.sub;
    const organizationId = req.user?.organizationId;

    // Body is JSON for metadata updates
    const body = req.body || {};

    return this.documentsService.updateMetadata({
      documentId: id,
      userId,
      organizationId,
      category: body.category,
      tags: body.tags,
      description: body.description,
      entityType: body.entityType,
      entityId: body.entityId,
    });
  }

  /**
   * DELETE /documents/:id
   */
  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.userId || req.user?.sub;
    const organizationId = req.user?.organizationId;

    return this.documentsService.delete({
      documentId: id,
      userId,
      organizationId,
    });
  }

  /**
   * GET /documents/:id/versions
   */
  @Get(':id/versions')
  async getVersions(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.userId || req.user?.sub;
    const organizationId = req.user?.organizationId;

    return this.documentsService.getVersions({
      documentId: id,
      userId,
      organizationId,
    });
  }

  /**
   * Parse multipart/form-data with both file and text fields.
   * Handles Cloud Functions pre-parsed body (rawBody) and standard Express.
   */
  private parseMultipartWithFields(
    req: Request,
  ): Promise<{
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number } | null;
    fields: Record<string, string>;
  }> {
    return new Promise((resolve, reject) => {
      const busboy = Busboy({
        headers: req.headers,
        limits: { fileSize: 10 * 1024 * 1024 },
      });

      const chunks: Buffer[] = [];
      let fileInfo: { filename: string; mimeType: string } | null = null;
      let limitReached = false;
      const fields: Record<string, string> = {};

      busboy.on(
        'file',
        (
          _fieldname: string,
          file: NodeJS.ReadableStream & { truncated?: boolean },
          info: { filename: string; mimeType: string },
        ) => {
          fileInfo = info;
          file.on('data', (chunk: Buffer) => chunks.push(chunk));
          file.on('limit', () => {
            limitReached = true;
          });
        },
      );

      busboy.on('field', (name: string, value: string) => {
        fields[name] = value;
      });

      busboy.on('finish', () => {
        if (limitReached) {
          reject(new BadRequestException('File too large (max 10MB)'));
          return;
        }

        let file: { buffer: Buffer; originalname: string; mimetype: string; size: number } | null = null;
        if (fileInfo) {
          const buffer = Buffer.concat(chunks);
          file = {
            buffer,
            originalname: fileInfo.filename,
            mimetype: fileInfo.mimeType,
            size: buffer.length,
          };
        }

        resolve({ file, fields });
      });

      busboy.on('error', (err: Error) =>
        reject(new BadRequestException(`Upload parse error: ${err.message}`)),
      );

      // Cloud Functions pre-parses body
      const rawBody = (req as any).rawBody;
      if (rawBody) {
        busboy.end(rawBody);
      } else {
        req.pipe(busboy);
      }
    });
  }
}
