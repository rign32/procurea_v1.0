import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService } from '../uploads/uploads.service';

const ALLOWED_CATEGORIES = [
  'certificate',
  'drawing',
  'nda',
  'spec',
  'quality_report',
  'contract',
  'other',
];

const ALLOWED_ENTITY_TYPES = ['supplier', 'rfq', 'offer', 'campaign'];

interface UploadedFileInfo {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
  ) {}

  /**
   * List documents with filters and pagination
   */
  async list(params: {
    userId: string;
    organizationId?: string;
    entityType?: string;
    entityId?: string;
    category?: string;
    tag?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      userId,
      organizationId,
      entityType,
      entityId,
      category,
      tag,
      search,
      page = 1,
      limit = 50,
    } = params;

    const where: any = {
      isLatest: true,
    };

    // Scope by organization or user
    if (organizationId) {
      where.organizationId = organizationId;
    } else {
      where.uploadedById = userId;
    }

    if (entityType) {
      if (!ALLOWED_ENTITY_TYPES.includes(entityType)) {
        throw new BadRequestException(
          `entityType must be one of: ${ALLOWED_ENTITY_TYPES.join(', ')}`,
        );
      }
      where.entityType = entityType;
    }
    if (entityId) where.entityId = entityId;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Tag filtering via JSON contains
    if (tag) {
      where.tags = { array_contains: [tag] };
    }

    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          uploadedBy: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.document.count({ where }),
    ]);

    return { data: documents, total, page, limit };
  }

  /**
   * Upload a new document
   */
  async upload(params: {
    userId: string;
    organizationId?: string;
    file: UploadedFileInfo;
    category?: string;
    tags?: string[];
    description?: string;
    entityType?: string;
    entityId?: string;
  }) {
    const { userId, organizationId, file, category, tags, description, entityType, entityId } =
      params;

    if (category && !ALLOWED_CATEGORIES.includes(category)) {
      throw new BadRequestException(
        `category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`,
      );
    }

    if (entityType && !ALLOWED_ENTITY_TYPES.includes(entityType)) {
      throw new BadRequestException(
        `entityType must be one of: ${ALLOWED_ENTITY_TYPES.join(', ')}`,
      );
    }

    // Use existing UploadsService for file storage
    const uploaded = await this.uploadsService.saveFile(file);

    const document = await this.prisma.document.create({
      data: {
        uploadedById: userId,
        organizationId: organizationId || null,
        filename: uploaded.storedFilename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        url: uploaded.url,
        category: category || null,
        tags: tags || [],
        description: description || null,
        entityType: entityType || null,
        entityId: entityId || null,
        version: 1,
        isLatest: true,
      },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
      },
    });

    this.logger.log(
      `Document uploaded: ${document.id} (${file.originalname}) by user ${userId}`,
    );

    return document;
  }

  /**
   * Upload a new version of an existing document
   */
  async uploadNewVersion(params: {
    documentId: string;
    userId: string;
    organizationId?: string;
    file: UploadedFileInfo;
  }) {
    const { documentId, userId, organizationId, file } = params;

    const existing = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!existing) {
      throw new NotFoundException('Document not found');
    }

    // Check ownership
    if (
      existing.uploadedById !== userId &&
      (!organizationId || existing.organizationId !== organizationId)
    ) {
      throw new ForbiddenException('You do not have access to this document');
    }

    // Upload file via UploadsService
    const uploaded = await this.uploadsService.saveFile(file);

    // Create new version and mark old as not latest in a transaction
    const [newDoc] = await this.prisma.$transaction([
      this.prisma.document.create({
        data: {
          uploadedById: userId,
          organizationId: existing.organizationId,
          filename: uploaded.storedFilename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          url: uploaded.url,
          category: existing.category,
          tags: existing.tags ?? [],
          description: existing.description,
          entityType: existing.entityType,
          entityId: existing.entityId,
          version: existing.version + 1,
          parentId: existing.id,
          isLatest: true,
        },
        include: {
          uploadedBy: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.document.update({
        where: { id: documentId },
        data: { isLatest: false },
      }),
    ]);

    this.logger.log(
      `New version uploaded: ${newDoc.id} (v${newDoc.version}) for document ${documentId}`,
    );

    return newDoc;
  }

  /**
   * Update document metadata
   */
  async updateMetadata(params: {
    documentId: string;
    userId: string;
    organizationId?: string;
    category?: string;
    tags?: string[];
    description?: string;
    entityType?: string;
    entityId?: string;
  }) {
    const { documentId, userId, organizationId, ...updates } = params;

    const existing = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!existing) {
      throw new NotFoundException('Document not found');
    }

    // Check ownership
    if (
      existing.uploadedById !== userId &&
      (!organizationId || existing.organizationId !== organizationId)
    ) {
      throw new ForbiddenException('You do not have access to this document');
    }

    if (updates.category && !ALLOWED_CATEGORIES.includes(updates.category)) {
      throw new BadRequestException(
        `category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`,
      );
    }

    if (updates.entityType && !ALLOWED_ENTITY_TYPES.includes(updates.entityType)) {
      throw new BadRequestException(
        `entityType must be one of: ${ALLOWED_ENTITY_TYPES.join(', ')}`,
      );
    }

    const data: any = {};
    if (updates.category !== undefined) data.category = updates.category;
    if (updates.tags !== undefined) data.tags = updates.tags;
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.entityType !== undefined) data.entityType = updates.entityType;
    if (updates.entityId !== undefined) data.entityId = updates.entityId;

    const document = await this.prisma.document.update({
      where: { id: documentId },
      data,
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
      },
    });

    this.logger.log(`Document metadata updated: ${documentId} by user ${userId}`);

    return document;
  }

  /**
   * Delete a document (hard delete)
   */
  async delete(params: {
    documentId: string;
    userId: string;
    organizationId?: string;
  }) {
    const { documentId, userId, organizationId } = params;

    const existing = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!existing) {
      throw new NotFoundException('Document not found');
    }

    // Check ownership
    if (
      existing.uploadedById !== userId &&
      (!organizationId || existing.organizationId !== organizationId)
    ) {
      throw new ForbiddenException('You do not have access to this document');
    }

    await this.prisma.document.delete({ where: { id: documentId } });

    this.logger.log(`Document deleted: ${documentId} by user ${userId}`);

    return { deleted: true };
  }

  /**
   * Get version history of a document
   */
  async getVersions(params: {
    documentId: string;
    userId: string;
    organizationId?: string;
  }) {
    const { documentId, userId, organizationId } = params;

    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Check ownership
    if (
      document.uploadedById !== userId &&
      (!organizationId || document.organizationId !== organizationId)
    ) {
      throw new ForbiddenException('You do not have access to this document');
    }

    // Walk up the chain to find root
    let rootId = documentId;
    let current = document;
    while (current.parentId) {
      rootId = current.parentId;
      const parent = await this.prisma.document.findUnique({
        where: { id: current.parentId },
      });
      if (!parent) break;
      current = parent;
    }

    // Get all versions from root downwards
    const allVersions = await this.prisma.document.findMany({
      where: {
        OR: [
          { id: rootId },
          { parentId: rootId },
          // For chains deeper than 2, also collect by walking from document
          { id: documentId },
        ],
      },
      orderBy: { version: 'desc' },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Deduplicate
    const seen = new Set<string>();
    const versions = allVersions.filter((v) => {
      if (seen.has(v.id)) return false;
      seen.add(v.id);
      return true;
    });

    return versions;
  }
}
