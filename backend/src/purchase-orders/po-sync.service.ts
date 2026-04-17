import {
    Injectable,
    Logger,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MergeDevAdapter } from '../integrations/adapters/merge-dev.adapter';

@Injectable()
export class PoSyncService {
    private readonly logger = new Logger(PoSyncService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly mergeAdapter: MergeDevAdapter,
    ) {}

    /**
     * Sync a Purchase Order to the customer's ERP via Merge.dev.
     *
     * Pre-requisites:
     *   1. Organization has an active IntegrationConnection (provider = "merge_dev")
     *   2. The PO's supplier has a confirmed SupplierMatch linking to an ExternalSupplier
     *      on that connection (so we know the ERP vendor ID).
     */
    async syncToErp(
        purchaseOrderId: string,
    ): Promise<{ success: boolean; externalId?: string; error?: string }> {
        // 1. Load PO with all relations needed for sync
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id: purchaseOrderId },
            include: {
                lines: { orderBy: { sortOrder: 'asc' } },
                contract: true,
                offer: {
                    include: {
                        supplier: {
                            include: {
                                externalMatches: {
                                    where: { status: 'confirmed' },
                                    include: { externalSupplier: true },
                                },
                            },
                        },
                    },
                },
                organization: {
                    include: { integrationConnections: true },
                },
            },
        });

        if (!po) throw new NotFoundException('Purchase order not found');

        if (po.externalId) {
            return {
                success: true,
                externalId: po.externalId,
                error: undefined,
            };
        }

        // 2. Find active integration connection (merge_dev)
        const connection = po.organization?.integrationConnections?.find(
            (c) => c.status === 'active' && c.provider === 'merge_dev',
        );
        if (!connection) {
            throw new BadRequestException(
                'No active ERP integration for this organization. Connect your ERP in Integrations settings first.',
            );
        }
        if (!connection.providerAccountToken) {
            throw new BadRequestException(
                'Integration connection is missing account token. Please reconnect your ERP.',
            );
        }

        // 3. Find confirmed supplier match for this connection
        const supplierMatch = po.offer?.supplier?.externalMatches?.find(
            (m) => m.externalSupplier?.connectionId === connection.id,
        );
        if (!supplierMatch) {
            throw new BadRequestException(
                'Supplier not matched to ERP vendor. Match the supplier first in Integrations settings.',
            );
        }

        const erpVendorId = supplierMatch.externalSupplierId;

        // 4. Call Merge.dev to create the PO
        this.logger.log(
            `Syncing PO ${po.poNumber ?? po.id} to ERP (connection=${connection.platformName}, vendor=${erpVendorId})`,
        );

        try {
            const result = await this.mergeAdapter.createPurchaseOrder(
                connection.providerAccountToken,
                {
                    supplierExternalId: erpVendorId,
                    lines: po.lines.map((l) => ({
                        description: l.description,
                        quantity: l.quantity,
                        unitPrice: l.unitPrice,
                    })),
                    deliveryDate: po.deliveryDate
                        ? po.deliveryDate.toISOString().split('T')[0]
                        : undefined,
                    totalAmount: po.totalAmount ?? undefined,
                    currency: po.currency || 'EUR',
                    memo: `Procurea PO ${po.poNumber ?? po.id.slice(0, 8)}`,
                },
            );

            // 5. Persist external ID and sync timestamp
            await this.prisma.purchaseOrder.update({
                where: { id: po.id },
                data: {
                    externalId: result.externalId,
                    externalSystem: connection.platformSlug || 'unknown',
                    syncedAt: new Date(),
                    // Auto-advance DRAFT → SUBMITTED on successful sync
                    ...(po.status === 'DRAFT' ? { status: 'SUBMITTED' } : {}),
                },
            });

            this.logger.log(
                `PO ${po.poNumber ?? po.id} synced successfully — externalId=${result.externalId}`,
            );

            return { success: true, externalId: result.externalId };
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : String(err);
            this.logger.error(
                `PO sync failed for ${po.poNumber ?? po.id}: ${message}`,
            );
            return { success: false, error: message };
        }
    }
}
