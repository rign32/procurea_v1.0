/**
 * Input shape for the matching engine — normalized representation of a supplier
 * from either side (Procurea DB or ExternalSupplier from ERP).
 */
export interface MatchCandidate {
    id: string;
    name: string | null;
    taxNumber?: string | null;
    website?: string | null;
    emails?: string[];
}

export type MatchType =
    | 'exact_tax'
    | 'exact_domain'
    | 'fuzzy_name'
    | 'composite'
    | 'manual';

export interface MatchSignals {
    taxMatch: boolean;
    domainMatch: boolean;
    nameSimilarity: number; // 0.0–1.0
    emailDomainMatch: boolean;
}

export interface MatchResult {
    confidence: number; // 0.0–1.0
    matchType: MatchType;
    signals: MatchSignals;
}

export interface PairwiseMatch {
    procureaId: string;
    externalId: string;
    result: MatchResult;
}
