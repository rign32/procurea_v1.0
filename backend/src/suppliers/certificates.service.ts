import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/services/tenant-context.service';
import {
  computeStatus,
  computeVerificationStatus,
  EXPIRY_ALERT_DAYS,
  type CertificateSource,
  type CertificateStatus,
  type CertificateType,
  type CertificateVerificationStatus,
} from './certificate-types';
import type { CreateCertificateDto, UpdateCertificateDto } from './dto/certificate.dto';

interface CertificateInput {
  type: CertificateType;
  code: string;
  issuer?: string;
  certNumber?: string;
  issuedAt?: string | Date | null;
  validUntil?: string | Date | null;
  documentId?: string | null;
  sourceUrl?: string | null;
  source?: CertificateSource;
  verificationStatus?: CertificateVerificationStatus;
}

@Injectable()
export class CertificatesService {
  private readonly logger = new Logger(CertificatesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async ensureSupplierAccess(supplierId: string, userId: string): Promise<void> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { id: true, campaignId: true },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');

    // Delegate tenant isolation to shared helper (campaign → rfqRequest.owner.organizationId)
    const tenant = await this.tenantContext.resolve(userId);
    const allowedCampaigns = await this.prisma.supplier.findMany({
      where: { id: supplierId, campaign: tenant.supplierCampaignFilter() },
      select: { id: true },
    });
    if (allowedCampaigns.length === 0) {
      throw new ForbiddenException('Not authorized to manage this supplier');
    }
  }

  async list(supplierId: string) {
    const certs = await this.prisma.supplierCertificate.findMany({
      where: { supplierId },
      orderBy: { validUntil: 'asc' },
      include: {
        document: {
          select: { id: true, originalName: true, url: true, mimeType: true },
        },
      },
    });
    // Re-derive status on read (cached value may drift if cron hasn't run)
    return certs.map((c) => ({ ...c, status: computeStatus(c.validUntil) }));
  }

  async create(supplierId: string, dto: CreateCertificateDto) {
    return this.createInternal(supplierId, dto);
  }

  async createInternal(supplierId: string, input: CertificateInput) {
    const source = input.source ?? 'MANUAL';

    // validUntil is REQUIRED for MANUAL/PORTAL (buyer/supplier-authored).
    // PIPELINE-discovered certs may lack a date — that's expected; status = UNKNOWN.
    let validUntil: Date | null = null;
    if (input.validUntil) {
      const parsed = new Date(input.validUntil);
      if (Number.isNaN(parsed.getTime())) {
        throw new BadRequestException('Invalid validUntil date');
      }
      validUntil = parsed;
    } else if (source !== 'PIPELINE') {
      throw new BadRequestException('validUntil is required for MANUAL/PORTAL certificates');
    }

    const status = computeStatus(validUntil);

    // Soft duplicate check — prevent overwriting with matching (type, code)
    const existing = await this.prisma.supplierCertificate.findFirst({
      where: { supplierId, type: input.type, code: input.code },
    });
    if (existing) {
      // PIPELINE runs often — dedupe silently instead of throwing
      if (source === 'PIPELINE') return existing;
      throw new BadRequestException(
        `Certificate ${input.type}/${input.code} already exists for this supplier`,
      );
    }

    // Review gate:
    //   MANUAL   → APPROVED (buyer-authored, trusted)
    //   PORTAL   → PENDING  (supplier-uploaded, needs buyer review)
    //   PIPELINE → PENDING  (AI-discovered, needs buyer review before counted as "active")
    const reviewStatus = source === 'MANUAL' ? 'APPROVED' : 'PENDING';

    // Evidence tier: caller can override, otherwise derive from signals.
    const verificationStatus =
      input.verificationStatus ??
      (source === 'MANUAL' || source === 'PORTAL'
        ? 'VERIFIED'
        : computeVerificationStatus({
            certNumber: input.certNumber,
            validUntil: input.validUntil,
            issuedAt: input.issuedAt,
            issuer: input.issuer,
            documentUrl: input.sourceUrl,
          }));

    return this.prisma.supplierCertificate.create({
      data: {
        supplierId,
        type: input.type,
        code: input.code,
        issuer: input.issuer || null,
        certNumber: input.certNumber || null,
        issuedAt: input.issuedAt ? new Date(input.issuedAt) : null,
        validUntil,
        documentId: input.documentId || null,
        sourceUrl: input.sourceUrl || null,
        status,
        source,
        reviewStatus,
        verificationStatus,
      },
      include: {
        document: {
          select: { id: true, originalName: true, url: true, mimeType: true },
        },
      },
    });
  }

  async update(certificateId: string, dto: UpdateCertificateDto) {
    const cert = await this.prisma.supplierCertificate.findUnique({
      where: { id: certificateId },
    });
    if (!cert) throw new NotFoundException('Certificate not found');

    const validUntil = dto.validUntil ? new Date(dto.validUntil) : cert.validUntil;
    const status = computeStatus(validUntil);

    // Buyer-typed updates promote PIPELINE cert to VERIFIED (they've reviewed the data).
    const shouldPromoteToVerified =
      cert.source === 'PIPELINE' && cert.verificationStatus !== 'VERIFIED';

    return this.prisma.supplierCertificate.update({
      where: { id: certificateId },
      data: {
        type: dto.type ?? cert.type,
        code: dto.code ?? cert.code,
        issuer: dto.issuer ?? cert.issuer,
        certNumber: dto.certNumber ?? cert.certNumber,
        issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : cert.issuedAt,
        validUntil,
        documentId: dto.documentId ?? cert.documentId,
        status,
        ...(shouldPromoteToVerified ? { verificationStatus: 'VERIFIED' as const } : {}),
      },
      include: {
        document: {
          select: { id: true, originalName: true, url: true, mimeType: true },
        },
      },
    });
  }

  async approve(supplierId: string, certificateId: string, reviewerId: string) {
    const cert = await this.prisma.supplierCertificate.findUnique({
      where: { id: certificateId },
    });
    // Prevents URL tampering: /suppliers/A/certificates/:id where :id
    // actually belongs to supplier B — return NotFound for both the real
    // not-found and the cross-supplier case (no info leak).
    if (!cert || cert.supplierId !== supplierId) {
      throw new NotFoundException('Certificate not found');
    }

    return this.prisma.supplierCertificate.update({
      where: { id: certificateId },
      data: {
        reviewStatus: 'APPROVED',
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        reviewNotes: null,
      },
      include: {
        document: {
          select: { id: true, originalName: true, url: true, mimeType: true },
        },
      },
    });
  }

  async reject(
    supplierId: string,
    certificateId: string,
    reviewerId: string,
    notes?: string,
  ) {
    const cert = await this.prisma.supplierCertificate.findUnique({
      where: { id: certificateId },
    });
    if (!cert || cert.supplierId !== supplierId) {
      throw new NotFoundException('Certificate not found');
    }

    return this.prisma.supplierCertificate.update({
      where: { id: certificateId },
      data: {
        reviewStatus: 'REJECTED',
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        reviewNotes: notes?.trim() || null,
      },
      include: {
        document: {
          select: { id: true, originalName: true, url: true, mimeType: true },
        },
      },
    });
  }

  async remove(certificateId: string): Promise<void> {
    const cert = await this.prisma.supplierCertificate.findUnique({
      where: { id: certificateId },
    });
    if (!cert) throw new NotFoundException('Certificate not found');
    await this.prisma.supplierCertificate.delete({ where: { id: certificateId } });
  }

  /**
   * Find certs expiring within `days` days and NOT already alerted in the last `alertCooldownHours` hours.
   * Used by daily scheduler to send email alerts.
   */
  async findExpiringForAlert(
    days: number = EXPIRY_ALERT_DAYS,
    alertCooldownHours: number = 24 * 6, // 6 days — weekly-ish cadence
  ) {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const cooldownCutoff = new Date(now.getTime() - alertCooldownHours * 60 * 60 * 1000);

    return this.prisma.supplierCertificate.findMany({
      where: {
        validUntil: { lte: windowEnd },
        reviewStatus: 'APPROVED', // don't alert on pending/rejected
        OR: [{ lastAlertedAt: null }, { lastAlertedAt: { lt: cooldownCutoff } }],
      },
      include: {
        supplier: {
          include: {
            campaign: {
              include: {
                rfqRequest: {
                  include: {
                    owner: {
                      select: { id: true, email: true, name: true, language: true, organizationId: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { validUntil: 'asc' },
    });
  }

  /**
   * Mark certs as alerted (prevents duplicate emails within cooldown window).
   */
  async markAlerted(certificateIds: string[]): Promise<void> {
    if (certificateIds.length === 0) return;
    await this.prisma.supplierCertificate.updateMany({
      where: { id: { in: certificateIds } },
      data: { lastAlertedAt: new Date() },
    });
  }

  /**
   * Re-compute cached status on all certs (scheduler can call nightly).
   * Skips rows with null validUntil (PIPELINE certs without a date → status stays UNKNOWN).
   */
  async refreshAllStatuses(): Promise<{ updated: number }> {
    const all = await this.prisma.supplierCertificate.findMany({
      select: { id: true, status: true, validUntil: true },
    });
    let updated = 0;
    for (const cert of all) {
      const computed = computeStatus(cert.validUntil);
      if (computed !== cert.status) {
        await this.prisma.supplierCertificate.update({
          where: { id: cert.id },
          data: { status: computed },
        });
        updated++;
      }
    }
    this.logger.log(`Refreshed ${updated}/${all.length} certificate statuses`);
    return { updated };
  }

  /**
   * Aggregate counts by status for a supplier — used on Supplier detail page.
   * Only APPROVED certs are counted so a PENDING portal-upload doesn't
   * silently boost the "aktywne" tally until the buyer reviews it.
   */
  async summaryForSupplier(
    supplierId: string,
  ): Promise<Record<CertificateStatus, number> & { pending: number; rejected: number }> {
    const certs = await this.list(supplierId);
    const summary: Record<CertificateStatus, number> & { pending: number; rejected: number } = {
      ACTIVE: 0,
      EXPIRING_SOON: 0,
      EXPIRED: 0,
      UNKNOWN: 0,
      pending: 0,
      rejected: 0,
    };
    for (const c of certs) {
      if (c.reviewStatus === 'PENDING') {
        summary.pending++;
        continue;
      }
      if (c.reviewStatus === 'REJECTED') {
        summary.rejected++;
        continue;
      }
      summary[c.status as CertificateStatus]++;
    }
    return summary;
  }
}
