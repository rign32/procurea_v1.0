import { Injectable, Logger } from '@nestjs/common';

interface ViesResult {
    valid: boolean;
    name?: string;
    address?: string;
    countryCode?: string;
}

/**
 * VIES VAT Validation Service — verifies EU company VAT numbers via European Commission API.
 * Free API, no key required. Rate limit: ~1 req/s.
 */
@Injectable()
export class VatValidationService {
    private readonly logger = new Logger(VatValidationService.name);
    private readonly cache = new Map<string, { result: ViesResult; timestamp: number }>();
    private readonly CACHE_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days
    private lastRequestTime = 0;
    private readonly MIN_DELAY_MS = 1200; // 1.2s between requests (VIES rate limit)

    // EU country codes that VIES supports
    private readonly EU_COUNTRIES = new Set([
        'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'EL', 'ES',
        'FI', 'FR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT',
        'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK',
    ]);

    /**
     * Extract VAT number from page content using common patterns.
     */
    extractVatFromContent(content: string): { countryCode: string; vatNumber: string } | null {
        if (!content) return null;

        // Pattern: EU VAT format (2-letter country code + 8-12 digits/chars)
        const euVatRegex = /\b(AT|BE|BG|CY|CZ|DE|DK|EE|EL|ES|FI|FR|HR|HU|IE|IT|LT|LU|LV|MT|NL|PL|PT|RO|SE|SI|SK)\s?([A-Z0-9]{8,12})\b/gi;
        const euMatch = euVatRegex.exec(content);
        if (euMatch) {
            return { countryCode: euMatch[1].toUpperCase(), vatNumber: euMatch[2] };
        }

        // Polish NIP: "NIP: 1234567890" or "NIP 123-456-78-90"
        const nipRegex = /NIP[:\s]+(\d[\d\s\-]{8,13}\d)/i;
        const nipMatch = nipRegex.exec(content);
        if (nipMatch) {
            const cleaned = nipMatch[1].replace(/[\s\-]/g, '');
            if (cleaned.length === 10) {
                return { countryCode: 'PL', vatNumber: cleaned };
            }
        }

        // German USt-IdNr: "DE123456789"
        const deVatRegex = /USt[\.\-]?Id(?:Nr)?[.:\s]+DE\s?(\d{9})/i;
        const deMatch = deVatRegex.exec(content);
        if (deMatch) {
            return { countryCode: 'DE', vatNumber: deMatch[1] };
        }

        return null;
    }

    /**
     * Validate a VAT number against the VIES API.
     * Returns null if country not in EU or on network error (non-blocking).
     */
    async validate(countryCode: string, vatNumber: string): Promise<ViesResult | null> {
        const upperCC = countryCode.toUpperCase();
        if (!this.EU_COUNTRIES.has(upperCC)) {
            return null; // Not an EU country — VIES doesn't support
        }

        const cacheKey = `${upperCC}:${vatNumber}`;
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
            return cached.result;
        }

        // Rate limiting
        const elapsed = Date.now() - this.lastRequestTime;
        if (elapsed < this.MIN_DELAY_MS) {
            await new Promise(r => setTimeout(r, this.MIN_DELAY_MS - elapsed));
        }
        this.lastRequestTime = Date.now();

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

            const response = await fetch(
                `https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ countryCode: upperCC, vatNumber }),
                    signal: controller.signal,
                },
            );
            clearTimeout(timeout);

            if (!response.ok) {
                this.logger.warn(`VIES API error: ${response.status} for ${upperCC}${vatNumber}`);
                return null;
            }

            const data = await response.json();
            const result: ViesResult = {
                valid: data.valid === true,
                name: data.name || undefined,
                address: data.address || undefined,
                countryCode: upperCC,
            };

            this.cache.set(cacheKey, { result, timestamp: Date.now() });
            this.logger.log(`VIES: ${upperCC}${vatNumber} → ${result.valid ? 'VALID' : 'INVALID'}${result.name ? ` (${result.name})` : ''}`);
            return result;
        } catch (e) {
            this.logger.warn(`VIES validation failed for ${upperCC}${vatNumber}: ${e.message}`);
            return null; // Non-blocking — skip on error
        }
    }

    /**
     * Convenience: extract VAT from content, validate, return trust bonus/penalty.
     * Returns: { vatVerified, trustBonus, registeredName, registeredAddress }
     */
    async validateFromContent(
        content: string,
        supplierCountryCode?: string,
    ): Promise<{ vatVerified: boolean | null; trustBonus: number; registeredName?: string; registeredAddress?: string }> {
        const extracted = this.extractVatFromContent(content);
        if (!extracted) {
            return { vatVerified: null, trustBonus: 0 }; // No VAT found — neutral
        }

        const result = await this.validate(extracted.countryCode, extracted.vatNumber);
        if (!result) {
            return { vatVerified: null, trustBonus: 0 }; // API unavailable — neutral
        }

        if (result.valid) {
            return {
                vatVerified: true,
                trustBonus: 15, // VAT valid → trust boost
                registeredName: result.name,
                registeredAddress: result.address,
            };
        } else {
            return {
                vatVerified: false,
                trustBonus: -20, // VAT explicitly invalid → trust penalty
            };
        }
    }
}
