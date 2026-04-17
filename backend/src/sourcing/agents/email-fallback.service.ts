import { Injectable, Logger } from '@nestjs/common';
import { validateMxRecord, extractDomain } from '../../common/utils/mx-validator';

export interface GeneratedEmail {
  email: string;
  confidence: 'low' | 'medium'; // 'medium' if MX validated, 'low' otherwise
  source: 'fallback-domain-generated';
  generatedAt: Date;
}

export interface FallbackGenerationInput {
  website: string;
  country?: string | null;
}

@Injectable()
export class EmailFallbackService {
  private readonly logger = new Logger(EmailFallbackService.name);

  /**
   * Generate candidate email addresses based on domain heuristics.
   * Returns empty array if website is invalid or domain has no MX records.
   */
  async generateWithValidation(input: FallbackGenerationInput): Promise<GeneratedEmail[]> {
    const domain = extractDomain(input.website);
    if (!domain) {
      this.logger.debug(`No valid domain from website: ${input.website}`);
      return [];
    }

    const hasMx = await validateMxRecord(domain);
    if (!hasMx) {
      this.logger.debug(`Domain ${domain} has no MX records — skipping fallback`);
      return [];
    }

    const candidates = this.buildCandidates(domain, input.country);
    return candidates.map((email) => ({
      email,
      confidence: 'medium' as const,
      source: 'fallback-domain-generated' as const,
      generatedAt: new Date(),
    }));
  }

  /**
   * Build candidate email list without validation (useful for testing).
   */
  buildCandidates(domain: string, country?: string | null): string[] {
    const base = [
      `contact@${domain}`,
      `sales@${domain}`,
      `info@${domain}`,
      `procurement@${domain}`,
    ];

    const countryUpper = country?.toUpperCase();
    const countrySpecific: string[] = [];
    if (countryUpper === 'PL') {
      countrySpecific.push(`biuro@${domain}`, `kontakt@${domain}`);
    } else if (countryUpper === 'DE' || countryUpper === 'AT') {
      countrySpecific.push(`verkauf@${domain}`, `vertrieb@${domain}`);
    } else if (countryUpper === 'FR') {
      countrySpecific.push(`contact@${domain}`, `ventes@${domain}`);
    } else if (countryUpper === 'ES') {
      countrySpecific.push(`ventas@${domain}`, `comercial@${domain}`);
    } else if (countryUpper === 'IT') {
      countrySpecific.push(`vendite@${domain}`, `info@${domain}`);
    }

    return Array.from(new Set([...base, ...countrySpecific]));
  }

  /**
   * Simple domain+MX-only check (fast path for pre-validation).
   */
  async validateDomain(website: string): Promise<boolean> {
    const domain = extractDomain(website);
    if (!domain) return false;
    return validateMxRecord(domain);
  }
}
