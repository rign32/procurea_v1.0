/**
 * Procurea Connect — abstraction over external supplier systems (ERP/CRM).
 *
 * First implementation: MergeDevAdapter (proxies 50+ systems via Merge.dev).
 * Future implementations: SapNativeAdapter, NetSuiteNativeAdapter (only when a
 * paying enterprise customer requires direct integration).
 *
 * All adapters MUST be side-effect free aside from calls to the target system.
 * Persistence (caching, matching) is handled outside the adapter.
 */

export interface ExternalSupplierData {
    externalId: string;
    name: string;
    taxNumber?: string | null;
    website?: string | null;
    primaryEmail?: string | null;
    emails?: string[];
    phoneNumbers?: string[];
    addresses?: Array<{
        city?: string;
        country?: string;
        postalCode?: string;
        addressLine1?: string;
    }>;
    currency?: string | null;
    isSupplier?: boolean;
    isActive?: boolean;
    rawData?: unknown;
}

export interface ExternalPurchaseOrderLine {
    description?: string;
    quantity?: number;
    unitPrice?: number;
    currency?: string;
}

export interface ExternalPurchaseOrderDraft {
    supplierExternalId: string;
    memo?: string;
    deliveryDate?: string;
    totalAmount?: number;
    currency?: string;
    lines: ExternalPurchaseOrderLine[];
}

export interface ConnectionCapabilities {
    contacts: {
        read: boolean;
        write: boolean;
    };
    purchaseOrders: {
        read: boolean;
        write: boolean;
    };
}

export interface LinkedAccountInfo {
    providerAccountId: string;
    integrationCategory: 'accounting' | 'crm' | 'hris';
    platformSlug: string;
    platformName: string;
    capabilities: ConnectionCapabilities;
}

export interface SupplierConnector {
    /**
     * Fetch all suppliers/vendors from the connected system.
     * Pagination is handled internally by the adapter.
     */
    listSuppliers(providerAccountId: string): Promise<ExternalSupplierData[]>;

    /**
     * Create a new supplier in the connected system.
     * Returns the externalId assigned by the target system.
     */
    createSupplier(
        providerAccountId: string,
        data: Partial<ExternalSupplierData>,
    ): Promise<{ externalId: string; raw?: unknown }>;

    /**
     * Create a purchase order draft. Only called when capabilities.purchaseOrders.write = true.
     */
    createPurchaseOrder(
        providerAccountId: string,
        draft: ExternalPurchaseOrderDraft,
    ): Promise<{ externalId: string; raw?: unknown }>;

    /**
     * Fetch current capability matrix for a specific linked account.
     * Merge.dev exposes per-integration capabilities dynamically.
     */
    getCapabilities(providerAccountId: string): Promise<ConnectionCapabilities>;

    /**
     * List all linked accounts for the authenticated Merge workspace.
     * Used during onboarding and sync worker enumeration.
     */
    listLinkedAccounts(): Promise<LinkedAccountInfo[]>;
}
