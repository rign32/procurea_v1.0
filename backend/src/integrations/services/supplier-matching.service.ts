import { Injectable, Logger } from '@nestjs/common';
import {
    MatchCandidate,
    MatchResult,
    MatchSignals,
    PairwiseMatch,
} from '../interfaces/supplier-match.interface';

// Thresholds tuned for procurement dedup — can be overridden per method call.
const DEFAULT_NAME_SIMILARITY_FLOOR = 0.82;
const FUZZY_NAME_STRONG = 0.95;
const COMPOSITE_NAME_FLOOR = 0.78;

// Corporate legal-entity suffixes stripped before name comparison.
// Covers common forms across PL / DE / UK / US / FR / IT / ES / NL — extend as we
// onboard new markets rather than trying to be exhaustive up front.
const LEGAL_SUFFIXES = [
    'sp. z o.o.', 'sp. z o.o', 'sp.z.o.o.', 'sp.z.o.o', 'sp zoo', 'spzoo',
    's.a.', 'sa',
    's.k.a.', 'ska',
    's.k.', 'sk',
    'sp. j.', 'spj',
    'sp. k.', 'spk',
    'gmbh', 'gmbh & co. kg', 'ag', 'kg', 'ohg',
    'inc', 'inc.', 'incorporated',
    'llc', 'l.l.c.',
    'corp', 'corp.', 'corporation',
    'ltd', 'ltd.', 'limited',
    'plc',
    's.r.l.', 'srl', 's.p.a.', 'spa',
    'sarl', 's.a.r.l.', 'sas',
    'b.v.', 'bv', 'n.v.', 'nv',
];

@Injectable()
export class SupplierMatchingService {
    private readonly logger = new Logger(SupplierMatchingService.name);

    /**
     * Score one Procurea supplier against one external supplier.
     * Deterministic — pure function of the inputs, no side effects.
     */
    scoreMatch(procurea: MatchCandidate, external: MatchCandidate): MatchResult {
        const signals = this.extractSignals(procurea, external);
        return this.signalsToResult(signals);
    }

    /**
     * Cross-match two lists. Returns only pairs at or above `minConfidence`.
     *
     * Uses tax-number index to short-circuit O(n*m) scan when tax data is available
     * — real-world ERPs return thousands of suppliers, full scan is unacceptable.
     */
    findBestMatches(
        procureaSuppliers: MatchCandidate[],
        externalSuppliers: MatchCandidate[],
        minConfidence = 0.7,
    ): PairwiseMatch[] {
        // Prebuild tax and domain indices over the smaller list (external)
        const externalByTax = new Map<string, MatchCandidate>();
        const externalByDomain = new Map<string, MatchCandidate[]>();
        for (const ext of externalSuppliers) {
            const tax = this.normalizeTaxNumber(ext.taxNumber);
            if (tax) externalByTax.set(tax, ext);
            const domain = this.extractRootDomain(ext.website);
            if (domain) {
                const list = externalByDomain.get(domain) ?? [];
                list.push(ext);
                externalByDomain.set(domain, list);
            }
        }

        const results: PairwiseMatch[] = [];

        for (const proc of procureaSuppliers) {
            const tax = this.normalizeTaxNumber(proc.taxNumber);
            if (tax) {
                const hit = externalByTax.get(tax);
                if (hit) {
                    // Short-circuit: tax match is authoritative
                    results.push({
                        procureaId: proc.id,
                        externalId: hit.id,
                        result: this.scoreMatch(proc, hit),
                    });
                    continue;
                }
            }

            const domain = this.extractRootDomain(proc.website);
            const candidates = domain ? externalByDomain.get(domain) ?? [] : [];

            // If domain didn't narrow it down, we fall back to a full name scan —
            // acceptable for MVP sizes (<5k external suppliers per tenant).
            const scanList = candidates.length > 0 ? candidates : externalSuppliers;

            let best: PairwiseMatch | null = null;
            for (const ext of scanList) {
                const result = this.scoreMatch(proc, ext);
                if (result.confidence < minConfidence) continue;
                if (!best || result.confidence > best.result.confidence) {
                    best = { procureaId: proc.id, externalId: ext.id, result };
                }
            }
            if (best) results.push(best);
        }

        return results;
    }

    // --- signal extraction ---

    private extractSignals(
        a: MatchCandidate,
        b: MatchCandidate,
    ): MatchSignals {
        const taxA = this.normalizeTaxNumber(a.taxNumber);
        const taxB = this.normalizeTaxNumber(b.taxNumber);
        const taxMatch = !!taxA && !!taxB && taxA === taxB;

        const domainA = this.extractRootDomain(a.website);
        const domainB = this.extractRootDomain(b.website);
        const domainMatch = !!domainA && !!domainB && domainA === domainB;

        const nameSimilarity = this.nameSimilarity(a.name, b.name);

        const emailDomainMatch = this.emailDomainsOverlap(a.emails, b.emails);

        return { taxMatch, domainMatch, nameSimilarity, emailDomainMatch };
    }

    private signalsToResult(signals: MatchSignals): MatchResult {
        // Priority order: tax > domain > strong fuzzy > composite.
        if (signals.taxMatch) {
            return { confidence: 1.0, matchType: 'exact_tax', signals };
        }
        if (signals.domainMatch) {
            // Domain alone is strong but not bulletproof (subsidiaries share domains).
            // Boost slightly if names also look similar.
            const conf = signals.nameSimilarity >= COMPOSITE_NAME_FLOOR ? 0.95 : 0.88;
            return { confidence: conf, matchType: 'exact_domain', signals };
        }
        if (signals.nameSimilarity >= FUZZY_NAME_STRONG) {
            return {
                confidence: signals.nameSimilarity,
                matchType: 'fuzzy_name',
                signals,
            };
        }
        if (signals.emailDomainMatch && signals.nameSimilarity >= COMPOSITE_NAME_FLOOR) {
            return {
                confidence: 0.82,
                matchType: 'composite',
                signals,
            };
        }
        if (signals.nameSimilarity >= DEFAULT_NAME_SIMILARITY_FLOOR) {
            return {
                confidence: signals.nameSimilarity * 0.85, // discount pure name matches
                matchType: 'fuzzy_name',
                signals,
            };
        }
        return { confidence: 0, matchType: 'fuzzy_name', signals };
    }

    // --- normalization helpers (exposed internal for testing) ---

    normalizeTaxNumber(raw?: string | null): string | null {
        if (!raw) return null;
        const cleaned = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        return cleaned.length >= 6 ? cleaned : null;
    }

    extractRootDomain(raw?: string | null): string | null {
        if (!raw) return null;
        let host: string;
        try {
            const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
            host = u.hostname;
        } catch {
            host = raw;
        }
        host = host.toLowerCase().replace(/^www\./, '').trim();
        if (!host || !host.includes('.')) return null;
        // Strip subdomains down to registrable domain (naive — good enough for MVP,
        // proper PSL library can replace this if we see false negatives).
        const parts = host.split('.');
        if (parts.length <= 2) return host;
        // Handle common two-part TLDs (.co.uk, .com.pl, etc.)
        const lastTwo = parts.slice(-2).join('.');
        const lastThree = parts.slice(-3).join('.');
        const TWO_PART_TLDS = new Set([
            'co.uk', 'org.uk', 'ac.uk', 'gov.uk',
            'com.pl', 'com.au', 'com.br', 'com.mx',
            'co.jp', 'co.kr', 'co.nz',
        ]);
        if (TWO_PART_TLDS.has(lastTwo)) return lastThree;
        return lastTwo;
    }

    normalizeName(raw?: string | null): string {
        if (!raw) return '';
        let n = raw.toLowerCase().trim();
        // Strip legal suffixes FIRST, while punctuation is still intact —
        // patterns like "sp. z o.o." depend on the dots being present.
        for (const suffix of LEGAL_SUFFIXES) {
            const pattern = new RegExp(`(?:^|\\s)${suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i');
            n = n.replace(pattern, '');
        }
        // Then strip residual punctuation so "Acme, Inc" → "Acme Inc" → "acme".
        n = n.replace(/[,.()\[\]"'`]/g, ' ');
        return n.replace(/\s+/g, ' ').trim();
    }

    nameSimilarity(a?: string | null, b?: string | null): number {
        const na = this.normalizeName(a);
        const nb = this.normalizeName(b);
        if (!na || !nb) return 0;
        if (na === nb) return 1;
        return this.jaroWinkler(na, nb);
    }

    private emailDomainsOverlap(a?: string[], b?: string[]): boolean {
        if (!a?.length || !b?.length) return false;
        const domainsA = new Set(
            a.map((e) => e.split('@')[1]?.toLowerCase()).filter(Boolean),
        );
        const domainsB = a && b ? b.map((e) => e.split('@')[1]?.toLowerCase()) : [];
        return domainsB.some((d) => d && domainsA.has(d));
    }

    /**
     * Jaro-Winkler similarity — 0.0 (no match) to 1.0 (identical).
     * Standard implementation; chosen over Levenshtein because it handles
     * prefix-preserving typos better (Acme Corp vs Acme Corporation).
     */
    private jaroWinkler(s1: string, s2: string, prefixScale = 0.1): number {
        if (s1 === s2) return 1;
        const len1 = s1.length;
        const len2 = s2.length;
        if (len1 === 0 || len2 === 0) return 0;

        const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;
        const s1Matches = new Array(len1).fill(false);
        const s2Matches = new Array(len2).fill(false);

        let matches = 0;
        for (let i = 0; i < len1; i++) {
            const start = Math.max(0, i - matchDistance);
            const end = Math.min(i + matchDistance + 1, len2);
            for (let j = start; j < end; j++) {
                if (s2Matches[j]) continue;
                if (s1[i] !== s2[j]) continue;
                s1Matches[i] = true;
                s2Matches[j] = true;
                matches++;
                break;
            }
        }

        if (matches === 0) return 0;

        let transpositions = 0;
        let k = 0;
        for (let i = 0; i < len1; i++) {
            if (!s1Matches[i]) continue;
            while (!s2Matches[k]) k++;
            if (s1[i] !== s2[k]) transpositions++;
            k++;
        }

        const m = matches;
        const jaro =
            (m / len1 + m / len2 + (m - transpositions / 2) / m) / 3;

        // Winkler boost for shared prefix (up to 4 chars)
        let prefix = 0;
        const maxPrefix = Math.min(4, len1, len2);
        for (let i = 0; i < maxPrefix; i++) {
            if (s1[i] === s2[i]) prefix++;
            else break;
        }
        return jaro + prefix * prefixScale * (1 - jaro);
    }
}
