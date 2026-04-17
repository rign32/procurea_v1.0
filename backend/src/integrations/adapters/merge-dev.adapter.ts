import {
    BadGatewayException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotImplementedException,
    ServiceUnavailableException,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosInstance } from 'axios';
import {
    ConnectionCapabilities,
    ExternalPurchaseOrderDraft,
    ExternalSupplierData,
    LinkedAccountInfo,
    SupplierConnector,
} from '../interfaces/supplier-connector.interface';

/**
 * Merge.dev adapter (first and only adapter for MVP).
 *
 * Auth model (Merge.dev standard):
 *   - MERGE_DEV_API_KEY        — workspace-level (shared across all linked accounts)
 *   - X-Account-Token per linked account — per-customer, persisted in IntegrationConnection
 *   - Base URL default         — https://api.merge.dev/api (override via MERGE_BASE_URL)
 *
 * Response shape reference: https://docs.merge.dev/accounting/overview/
 *
 * Wave 1 implementation scope:
 *   - listSuppliers()   — LIVE (paginated contacts?is_supplier=true)
 *   - getCapabilities() — LIVE (account-details integration metadata)
 *   - createSupplier(), createPurchaseOrder(), listLinkedAccounts() — stubs for Wave 3.
 */

/**
 * Subset of the Merge.dev Contact Common Model we rely on.
 * Full schema: https://docs.merge.dev/accounting/contacts/
 */
export interface MergeContact {
    id: string;
    remote_id: string | null;
    name: string | null;
    is_supplier: boolean;
    is_customer: boolean;
    email_addresses: Array<{
        email_address: string;
        email_address_type: string | null;
    }>;
    phone_numbers: Array<{
        number: string;
        type: string | null;
    }>;
    addresses: Array<{
        street_1: string | null;
        street_2: string | null;
        city: string | null;
        country: string | null;
        zip_code?: string | null;
        state?: string | null;
    }>;
    tax_number: string | null;
    currency?: string | null;
    remote_was_deleted?: boolean;
}

interface MergePaginatedResponse<T> {
    next: string | null;
    previous: string | null;
    results: T[];
}

interface MergeAccountDetails {
    id?: string;
    integration?: {
        name?: string;
        slug?: string;
        categories?: string[];
    };
    category?: string;
    status?: string;
    end_user_origin_id?: string;
    end_user_organization_name?: string;
}

@Injectable()
export class MergeDevAdapter implements SupplierConnector {
    private readonly logger = new Logger(MergeDevAdapter.name);
    private readonly apiKey: string | null;
    private readonly baseUrl: string;
    private readonly http: AxiosInstance;

    // Whitelist of Merge.dev integration slugs known to support PO writes.
    // Sources: https://www.merge.dev/integrations (accounting write-support grid).
    // Kept here (not config) because it's implementation metadata, not deployment config.
    private static readonly PO_WRITE_SUPPORTED_SLUGS = new Set<string>([
        'netsuite',
        'quickbooks-online',
        'xero',
        'sage-intacct',
    ]);

    constructor(private readonly config: ConfigService) {
        this.apiKey =
            this.config.get<string>('MERGE_DEV_API_KEY') ??
            this.config.get<string>('MERGE_API_KEY') ??
            null;
        this.baseUrl =
            this.config.get<string>('MERGE_BASE_URL') ??
            'https://api.merge.dev/api';

        this.http = axios.create({
            baseURL: this.baseUrl,
            timeout: 30_000,
        });

        if (!this.apiKey) {
            this.logger.warn(
                'MERGE_DEV_API_KEY not configured — Procurea Connect disabled',
            );
        }
    }

    isConfigured(): boolean {
        return !!this.apiKey;
    }

    async listSuppliers(
        providerAccountToken: string,
    ): Promise<ExternalSupplierData[]> {
        this.ensureConfigured();
        const apiKey = this.apiKey as string;

        const allContacts: MergeContact[] = [];
        let cursor: string | null = null;
        const MAX_PAGES = 20; // safety — 100/page × 20 = 2000 suppliers cap per sync
        const PAGE_SIZE = 100;
        let pageCount = 0;

        this.logger.debug(
            `listSuppliers(token=${this.mask(providerAccountToken)}) — starting`,
        );

        do {
            const params: Record<string, string> = {
                is_supplier: 'true',
                page_size: String(PAGE_SIZE),
            };
            if (cursor) params.cursor = cursor;

            let response;
            try {
                response = await this.http.get<
                    MergePaginatedResponse<MergeContact>
                >('/accounting/v1/contacts', {
                    params,
                    headers: this.buildHeaders(apiKey, providerAccountToken),
                });
            } catch (err) {
                this.rethrowAxios(err, 'listSuppliers');
            }

            const data = response!.data;
            const pageResults = Array.isArray(data.results) ? data.results : [];
            allContacts.push(...pageResults);

            cursor = this.extractCursor(data.next);
            pageCount++;

            this.logger.debug(
                `listSuppliers page ${pageCount}: +${pageResults.length} (total ${allContacts.length}, nextCursor=${cursor ? 'yes' : 'no'})`,
            );
        } while (cursor && pageCount < MAX_PAGES);

        if (cursor && pageCount >= MAX_PAGES) {
            this.logger.warn(
                `listSuppliers hit MAX_PAGES=${MAX_PAGES} cap (${allContacts.length} contacts) — further pages ignored`,
            );
        }

        return allContacts.map((c) => this.mapContactToSupplier(c));
    }

    async createSupplier(
        providerAccountToken: string,
        data: Partial<ExternalSupplierData>,
    ): Promise<{ externalId: string; raw?: unknown }> {
        this.ensureConfigured();
        this.logger.debug(
            `createSupplier(token=${this.mask(providerAccountToken)}, name=${data.name}) — stub`,
        );
        // Wave 3 — implemented in sprint/w3-d-po-export
        throw new NotImplementedException(
            'MergeDevAdapter.createSupplier scheduled for Wave 3 (sprint/w3-d-po-export)',
        );
    }

    async createPurchaseOrder(
        providerAccountToken: string,
        draft: ExternalPurchaseOrderDraft,
    ): Promise<{ externalId: string; raw?: unknown }> {
        this.ensureConfigured();
        this.logger.debug(
            `createPurchaseOrder(token=${this.mask(providerAccountToken)}, lines=${draft.lines.length}) — stub`,
        );
        // Wave 3 — implemented in sprint/w3-d-po-export
        throw new NotImplementedException(
            'MergeDevAdapter.createPurchaseOrder scheduled for Wave 3 (sprint/w3-d-po-export)',
        );
    }

    async getCapabilities(
        providerAccountToken: string,
    ): Promise<ConnectionCapabilities> {
        this.ensureConfigured();
        const apiKey = this.apiKey as string;

        this.logger.debug(
            `getCapabilities(token=${this.mask(providerAccountToken)})`,
        );

        let response;
        try {
            response = await this.http.get<MergeAccountDetails>(
                '/accounting/v1/account-details',
                {
                    headers: this.buildHeaders(apiKey, providerAccountToken),
                    timeout: 10_000,
                },
            );
        } catch (err) {
            this.rethrowAxios(err, 'getCapabilities');
        }

        const details = response!.data ?? {};
        const slug = details.integration?.slug ?? null;
        const supportsPOWrite = this.integrationSupportsPOWrite(slug);

        return {
            contacts: {
                read: true, // every accounting integration on Merge exposes contacts read
                write: false, // conservative default — enable per-integration in Wave 3
            },
            purchaseOrders: {
                read: supportsPOWrite, // read typically available wherever write is
                write: supportsPOWrite,
            },
        };
    }

    async listLinkedAccounts(): Promise<LinkedAccountInfo[]> {
        this.ensureConfigured();
        this.logger.debug('listLinkedAccounts() — stub');
        // Wave 3 — implemented in sprint/w3-d-po-export
        throw new NotImplementedException(
            'MergeDevAdapter.listLinkedAccounts scheduled for Wave 3 (sprint/w3-d-po-export)',
        );
    }

    // ---------------------------------------------------------------- helpers

    /**
     * Map Merge Contact → Procurea's ExternalSupplierData.
     * Public for unit testing.
     */
    mapContactToSupplier(contact: MergeContact): ExternalSupplierData {
        const emails =
            contact.email_addresses
                ?.map((e) => e.email_address)
                .filter((v): v is string => !!v) ?? [];
        const phones =
            contact.phone_numbers
                ?.map((p) => p.number)
                .filter((v): v is string => !!v) ?? [];
        const addresses =
            contact.addresses?.map((a) => ({
                city: a.city ?? undefined,
                country: a.country ?? undefined,
                postalCode: a.zip_code ?? undefined,
                addressLine1:
                    [a.street_1, a.street_2].filter(Boolean).join(' ') ||
                    undefined,
            })) ?? [];

        return {
            externalId: contact.id,
            name: contact.name ?? 'Unknown',
            taxNumber: contact.tax_number ?? null,
            website: null, // Merge Contact common model doesn't expose a website field
            primaryEmail: emails[0] ?? null,
            emails,
            phoneNumbers: phones,
            addresses: addresses.length ? addresses : undefined,
            currency: contact.currency ?? null,
            isSupplier: contact.is_supplier ?? true,
            isActive: contact.remote_was_deleted === true ? false : true,
            rawData: contact,
        };
    }

    /**
     * Public for unit testing.
     */
    integrationSupportsPOWrite(slug: string | null): boolean {
        if (!slug) return false;
        return MergeDevAdapter.PO_WRITE_SUPPORTED_SLUGS.has(slug);
    }

    private buildHeaders(
        apiKey: string,
        accountToken: string,
    ): Record<string, string> {
        return {
            Authorization: `Bearer ${apiKey}`,
            'X-Account-Token': accountToken,
            Accept: 'application/json',
        };
    }

    /**
     * Merge returns `next` as a full URL containing `cursor=...`. Extract just the cursor
     * so we can build the next request with our own params. Returns null when no next page.
     */
    private extractCursor(nextUrl: string | null): string | null {
        if (!nextUrl) return null;
        try {
            return new URL(nextUrl).searchParams.get('cursor');
        } catch {
            // In case Merge returns a relative URL or malformed value, extract via regex fallback.
            const match = /[?&]cursor=([^&]+)/.exec(nextUrl);
            return match ? decodeURIComponent(match[1]) : null;
        }
    }

    private ensureConfigured(): void {
        if (!this.apiKey) {
            throw new ServiceUnavailableException(
                'Procurea Connect is not configured on this instance (MERGE_DEV_API_KEY missing).',
            );
        }
    }

    private mask(token: string): string {
        if (!token) return '<empty>';
        if (token.length <= 8) return '***';
        return `${token.slice(0, 4)}…${token.slice(-4)}`;
    }

    /**
     * Translate an axios error into a meaningful HTTP exception for the NestJS layer.
     * Sanitizes any tokens before logging.
     */
    private rethrowAxios(err: unknown, op: string): never {
        if (axios.isAxiosError(err)) {
            const axErr = err as AxiosError;
            const status = axErr.response?.status;
            const body = this.sanitizeErrorBody(axErr.response?.data);
            this.logger.error(
                `Merge.dev ${op} failed (status=${status ?? 'n/a'}): ${body}`,
            );

            if (status === 401 || status === 403) {
                throw new UnauthorizedException(
                    `Merge.dev rejected credentials for ${op} (${status})`,
                );
            }
            if (status && status >= 500 && status < 600) {
                throw new BadGatewayException(
                    `Merge.dev upstream error on ${op} (status ${status})`,
                );
            }
            if (status && status >= 400 && status < 500) {
                throw new BadGatewayException(
                    `Merge.dev request for ${op} failed (status ${status})`,
                );
            }
        }

        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`Merge.dev ${op} unknown failure: ${message}`);
        throw new InternalServerErrorException(
            `Unexpected failure calling Merge.dev (${op})`,
        );
    }

    /**
     * Ensures we never leak tokens when logging error bodies.
     * Merge responses may echo request headers/params in some error shapes.
     */
    private sanitizeErrorBody(body: unknown): string {
        if (body == null) return '';
        try {
            const raw =
                typeof body === 'string' ? body : JSON.stringify(body);
            return raw
                .replace(/Bearer\s+[A-Za-z0-9._\-]+/g, 'Bearer ***')
                .replace(/"X-Account-Token"\s*:\s*"[^"]+"/g, '"X-Account-Token":"***"')
                .slice(0, 2000);
        } catch {
            return '[unserializable error body]';
        }
    }
}
