import { ConfigService } from '@nestjs/config';
import {
    BadGatewayException,
    ServiceUnavailableException,
    UnauthorizedException,
    NotImplementedException,
} from '@nestjs/common';
import axios from 'axios';
import { MergeDevAdapter, MergeContact } from './merge-dev.adapter';

jest.mock('axios');

/**
 * Tests the Wave 1 subset of MergeDevAdapter:
 *   - listSuppliers (paginated HTTP)
 *   - getCapabilities (single HTTP)
 *   - mapContactToSupplier (pure mapping)
 *   - integrationSupportsPOWrite (whitelist)
 *   - error handling surface (401 → Unauthorized, 5xx → BadGateway)
 *   - missing API key → ServiceUnavailableException
 *
 * createSupplier / createPurchaseOrder / listLinkedAccounts are confirmed to throw
 * NotImplementedException (Wave 3 scope).
 */
describe('MergeDevAdapter', () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;

    // We stub the instance created by axios.create() with a `.get` method we can assert against.
    let getMock: jest.Mock;

    const buildAdapter = (env: Record<string, string | undefined>) => {
        const config = new ConfigService(env);
        return new MergeDevAdapter(config);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        getMock = jest.fn();

        // axios.create returns our stubbed instance; axios.isAxiosError is real logic.
        mockedAxios.create = jest.fn().mockReturnValue({ get: getMock }) as any;
        mockedAxios.isAxiosError = ((err: any): err is any =>
            !!err && err.isAxiosError === true) as any;
    });

    // -------------------------------------------------------- configuration

    describe('configuration', () => {
        it('ensureConfigured throws when MERGE_DEV_API_KEY missing', async () => {
            const adapter = buildAdapter({});
            expect(adapter.isConfigured()).toBe(false);
            await expect(adapter.listSuppliers('tok_x')).rejects.toBeInstanceOf(
                ServiceUnavailableException,
            );
            await expect(
                adapter.getCapabilities('tok_x'),
            ).rejects.toBeInstanceOf(ServiceUnavailableException);
        });

        it('honors MERGE_DEV_API_KEY and defaults base URL to api.merge.dev', () => {
            const adapter = buildAdapter({ MERGE_DEV_API_KEY: 'mk_test_abc' });
            expect(adapter.isConfigured()).toBe(true);
            expect(mockedAxios.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    baseURL: 'https://api.merge.dev/api',
                }),
            );
        });

        it('falls back to MERGE_API_KEY when MERGE_DEV_API_KEY unset', () => {
            const adapter = buildAdapter({ MERGE_API_KEY: 'legacy_key' });
            expect(adapter.isConfigured()).toBe(true);
        });

        it('overrides base URL via MERGE_BASE_URL', () => {
            buildAdapter({
                MERGE_DEV_API_KEY: 'mk_test_abc',
                MERGE_BASE_URL: 'https://api-eu.merge.dev/api',
            });
            expect(mockedAxios.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    baseURL: 'https://api-eu.merge.dev/api',
                }),
            );
        });
    });

    // -------------------------------------------------------- mapping logic

    describe('mapContactToSupplier', () => {
        const adapter = (() => buildAdapter({ MERGE_DEV_API_KEY: 'k' }))();

        it('maps a full Merge contact to ExternalSupplierData', () => {
            const c: MergeContact = {
                id: 'contact_1',
                remote_id: 'rem_1',
                name: 'Acme Sp. z o.o.',
                is_supplier: true,
                is_customer: false,
                email_addresses: [
                    {
                        email_address: 'ap@acme.pl',
                        email_address_type: 'WORK',
                    },
                    {
                        email_address: 'invoices@acme.pl',
                        email_address_type: 'OTHER',
                    },
                ],
                phone_numbers: [{ number: '+48123456789', type: 'WORK' }],
                addresses: [
                    {
                        street_1: 'ul. Przemysłowa 5',
                        street_2: null,
                        city: 'Warszawa',
                        country: 'PL',
                        zip_code: '00-001',
                        state: null,
                    },
                ],
                tax_number: 'PL1234567890',
                currency: 'PLN',
                remote_was_deleted: false,
            };
            const mapped = adapter.mapContactToSupplier(c);
            expect(mapped).toMatchObject({
                externalId: 'contact_1',
                name: 'Acme Sp. z o.o.',
                taxNumber: 'PL1234567890',
                website: null,
                primaryEmail: 'ap@acme.pl',
                emails: ['ap@acme.pl', 'invoices@acme.pl'],
                phoneNumbers: ['+48123456789'],
                currency: 'PLN',
                isSupplier: true,
                isActive: true,
            });
            expect(mapped.addresses).toEqual([
                {
                    city: 'Warszawa',
                    country: 'PL',
                    postalCode: '00-001',
                    addressLine1: 'ul. Przemysłowa 5',
                },
            ]);
            expect(mapped.rawData).toBe(c);
        });

        it('handles null name → "Unknown" sentinel', () => {
            const c: MergeContact = {
                id: 'x',
                remote_id: null,
                name: null,
                is_supplier: true,
                is_customer: false,
                email_addresses: [],
                phone_numbers: [],
                addresses: [],
                tax_number: null,
            };
            expect(adapter.mapContactToSupplier(c).name).toBe('Unknown');
            expect(adapter.mapContactToSupplier(c).primaryEmail).toBeNull();
            expect(adapter.mapContactToSupplier(c).phoneNumbers).toEqual([]);
        });

        it('marks soft-deleted contacts inactive', () => {
            const c: MergeContact = {
                id: 'x',
                remote_id: null,
                name: 'Gone LLC',
                is_supplier: true,
                is_customer: false,
                email_addresses: [],
                phone_numbers: [],
                addresses: [],
                tax_number: null,
                remote_was_deleted: true,
            };
            expect(adapter.mapContactToSupplier(c).isActive).toBe(false);
        });
    });

    // ------------------------------------------- PO write integration gate

    describe('integrationSupportsPOWrite', () => {
        const adapter = buildAdapter({ MERGE_DEV_API_KEY: 'k' });

        it('returns true for whitelisted slugs', () => {
            expect(adapter.integrationSupportsPOWrite('netsuite')).toBe(true);
            expect(adapter.integrationSupportsPOWrite('quickbooks-online')).toBe(
                true,
            );
            expect(adapter.integrationSupportsPOWrite('xero')).toBe(true);
            expect(adapter.integrationSupportsPOWrite('sage-intacct')).toBe(
                true,
            );
        });

        it('returns false for unknown or null slug', () => {
            expect(adapter.integrationSupportsPOWrite('salesforce')).toBe(
                false,
            );
            expect(adapter.integrationSupportsPOWrite('quickbooks-desktop')).toBe(
                false,
            );
            expect(adapter.integrationSupportsPOWrite(null)).toBe(false);
            expect(adapter.integrationSupportsPOWrite('')).toBe(false);
        });
    });

    // ------------------------------------------------------ listSuppliers

    describe('listSuppliers (paginated)', () => {
        const makeContact = (id: string, name: string): MergeContact => ({
            id,
            remote_id: id,
            name,
            is_supplier: true,
            is_customer: false,
            email_addresses: [],
            phone_numbers: [],
            addresses: [],
            tax_number: null,
        });

        it('walks all pages and aggregates results', async () => {
            const adapter = buildAdapter({ MERGE_DEV_API_KEY: 'mk_abc' });

            getMock
                .mockResolvedValueOnce({
                    data: {
                        next: 'https://api.merge.dev/api/accounting/v1/contacts?cursor=PAGE2',
                        previous: null,
                        results: [
                            makeContact('c1', 'One'),
                            makeContact('c2', 'Two'),
                        ],
                    },
                })
                .mockResolvedValueOnce({
                    data: {
                        next: null,
                        previous: 'prev',
                        results: [makeContact('c3', 'Three')],
                    },
                });

            const suppliers = await adapter.listSuppliers('account_tok_xyz');

            expect(suppliers).toHaveLength(3);
            expect(suppliers.map((s) => s.externalId)).toEqual([
                'c1',
                'c2',
                'c3',
            ]);
            expect(getMock).toHaveBeenCalledTimes(2);

            // First request has no cursor; second has cursor=PAGE2
            const firstCall = getMock.mock.calls[0];
            expect(firstCall[0]).toBe('/accounting/v1/contacts');
            expect(firstCall[1].params).toMatchObject({
                is_supplier: 'true',
                page_size: '100',
            });
            expect(firstCall[1].params.cursor).toBeUndefined();

            const secondCall = getMock.mock.calls[1];
            expect(secondCall[1].params.cursor).toBe('PAGE2');

            // Both calls carry auth headers
            expect(firstCall[1].headers).toEqual(
                expect.objectContaining({
                    Authorization: 'Bearer mk_abc',
                    'X-Account-Token': 'account_tok_xyz',
                    Accept: 'application/json',
                }),
            );
        });

        it('stops when next is null on the first page', async () => {
            const adapter = buildAdapter({ MERGE_DEV_API_KEY: 'mk_abc' });

            getMock.mockResolvedValueOnce({
                data: {
                    next: null,
                    previous: null,
                    results: [makeContact('only', 'Only')],
                },
            });

            const suppliers = await adapter.listSuppliers('tok');
            expect(suppliers).toHaveLength(1);
            expect(getMock).toHaveBeenCalledTimes(1);
        });

        it('maps 401 → UnauthorizedException', async () => {
            const adapter = buildAdapter({ MERGE_DEV_API_KEY: 'mk_abc' });
            getMock.mockRejectedValueOnce({
                isAxiosError: true,
                response: { status: 401, data: { detail: 'Invalid token' } },
                message: '401',
            });
            await expect(adapter.listSuppliers('tok')).rejects.toBeInstanceOf(
                UnauthorizedException,
            );
        });

        it('maps 502 → BadGatewayException', async () => {
            const adapter = buildAdapter({ MERGE_DEV_API_KEY: 'mk_abc' });
            getMock.mockRejectedValueOnce({
                isAxiosError: true,
                response: { status: 502, data: 'upstream error' },
                message: 'upstream',
            });
            await expect(adapter.listSuppliers('tok')).rejects.toBeInstanceOf(
                BadGatewayException,
            );
        });
    });

    // ------------------------------------------------------ getCapabilities

    describe('getCapabilities', () => {
        it('returns PO write=true for netsuite integration', async () => {
            const adapter = buildAdapter({ MERGE_DEV_API_KEY: 'mk_abc' });
            getMock.mockResolvedValueOnce({
                data: {
                    integration: {
                        name: 'NetSuite',
                        slug: 'netsuite',
                        categories: ['accounting'],
                    },
                    category: 'accounting',
                    status: 'COMPLETE',
                },
            });

            const caps = await adapter.getCapabilities('tok');
            expect(caps).toEqual({
                contacts: { read: true, write: false },
                purchaseOrders: { read: true, write: true },
            });
            expect(getMock).toHaveBeenCalledWith(
                '/accounting/v1/account-details',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer mk_abc',
                        'X-Account-Token': 'tok',
                    }),
                }),
            );
        });

        it('returns PO write=false for unlisted integration (e.g. freshbooks)', async () => {
            const adapter = buildAdapter({ MERGE_DEV_API_KEY: 'mk_abc' });
            getMock.mockResolvedValueOnce({
                data: {
                    integration: { name: 'FreshBooks', slug: 'freshbooks' },
                    category: 'accounting',
                },
            });

            const caps = await adapter.getCapabilities('tok');
            expect(caps.purchaseOrders.write).toBe(false);
            expect(caps.purchaseOrders.read).toBe(false);
            expect(caps.contacts.read).toBe(true);
        });
    });

    // ------------------------------------------------------ Wave 3 stubs

    describe('Wave 3 stubs', () => {
        const adapter = buildAdapter({ MERGE_DEV_API_KEY: 'mk_abc' });

        it('createSupplier throws NotImplementedException', async () => {
            await expect(
                adapter.createSupplier('tok', { name: 'X' }),
            ).rejects.toBeInstanceOf(NotImplementedException);
        });

        it('createPurchaseOrder throws NotImplementedException', async () => {
            await expect(
                adapter.createPurchaseOrder('tok', {
                    supplierExternalId: 'x',
                    lines: [],
                }),
            ).rejects.toBeInstanceOf(NotImplementedException);
        });

        it('listLinkedAccounts throws NotImplementedException', async () => {
            await expect(adapter.listLinkedAccounts()).rejects.toBeInstanceOf(
                NotImplementedException,
            );
        });
    });
});
