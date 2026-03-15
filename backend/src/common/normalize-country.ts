/**
 * Country name normalization utility.
 * Converts ISO codes, English names, and common variants
 * to standardized Polish country names.
 */

const COUNTRY_MAP: Record<string, string> = {
    // ISO 2-letter codes
    'de': 'Niemcy',
    'pl': 'Polska',
    'cz': 'Czechy',
    'sk': 'Słowacja',
    'hu': 'Węgry',
    'at': 'Austria',
    'fr': 'Francja',
    'it': 'Włochy',
    'es': 'Hiszpania',
    'nl': 'Holandia',
    'be': 'Belgia',
    'ch': 'Szwajcaria',
    'gb': 'Wielka Brytania',
    'uk': 'Wielka Brytania',
    'us': 'USA',
    'ca': 'Kanada',
    'cn': 'Chiny',
    'tw': 'Tajwan',
    'jp': 'Japonia',
    'kr': 'Korea Południowa',
    'in': 'Indie',
    'th': 'Tajlandia',
    'vn': 'Wietnam',
    'tr': 'Turcja',
    'se': 'Szwecja',
    'dk': 'Dania',
    'no': 'Norwegia',
    'fi': 'Finlandia',
    'pt': 'Portugalia',
    'ro': 'Rumunia',
    'bg': 'Bułgaria',
    'hr': 'Chorwacja',
    'si': 'Słowenia',
    'lt': 'Litwa',
    'lv': 'Łotwa',
    'ee': 'Estonia',
    'ie': 'Irlandia',
    'lu': 'Luksemburg',
    'mx': 'Meksyk',
    'br': 'Brazylia',
    'ar': 'Argentyna',
    'au': 'Australia',
    'nz': 'Nowa Zelandia',
    'za': 'RPA',
    'my': 'Malezja',
    'sg': 'Singapur',
    'id': 'Indonezja',
    'ph': 'Filipiny',
    'il': 'Izrael',
    'ae': 'ZEA',
    'sa': 'Arabia Saudyjska',
    'ua': 'Ukraina',

    // English names → Polish
    'germany': 'Niemcy',
    'poland': 'Polska',
    'czech republic': 'Czechy',
    'czechia': 'Czechy',
    'slovakia': 'Słowacja',
    'hungary': 'Węgry',
    'austria': 'Austria',
    'france': 'Francja',
    'italy': 'Włochy',
    'spain': 'Hiszpania',
    'netherlands': 'Holandia',
    'the netherlands': 'Holandia',
    'belgium': 'Belgia',
    'switzerland': 'Szwajcaria',
    'united kingdom': 'Wielka Brytania',
    'great britain': 'Wielka Brytania',
    'england': 'Wielka Brytania',
    'united states': 'USA',
    'united states of america': 'USA',
    'usa': 'USA',
    'canada': 'Kanada',
    'china': 'Chiny',
    'taiwan': 'Tajwan',
    'japan': 'Japonia',
    'south korea': 'Korea Południowa',
    'korea': 'Korea Południowa',
    'india': 'Indie',
    'thailand': 'Tajlandia',
    'vietnam': 'Wietnam',
    'turkey': 'Turcja',
    'türkiye': 'Turcja',
    'sweden': 'Szwecja',
    'denmark': 'Dania',
    'norway': 'Norwegia',
    'finland': 'Finlandia',
    'portugal': 'Portugalia',
    'romania': 'Rumunia',
    'bulgaria': 'Bułgaria',
    'croatia': 'Chorwacja',
    'slovenia': 'Słowenia',
    'lithuania': 'Litwa',
    'latvia': 'Łotwa',
    'estonia': 'Estonia',
    'ireland': 'Irlandia',
    'luxembourg': 'Luksemburg',
    'mexico': 'Meksyk',
    'brazil': 'Brazylia',
    'argentina': 'Argentyna',
    'australia': 'Australia',
    'new zealand': 'Nowa Zelandia',
    'south africa': 'RPA',
    'malaysia': 'Malezja',
    'singapore': 'Singapur',
    'indonesia': 'Indonezja',
    'philippines': 'Filipiny',
    'israel': 'Izrael',
    'united arab emirates': 'ZEA',
    'saudi arabia': 'Arabia Saudyjska',
    'ukraine': 'Ukraina',

    // Polish names (pass through)
    'niemcy': 'Niemcy',
    'polska': 'Polska',
    'czechy': 'Czechy',
    'francja': 'Francja',
    'włochy': 'Włochy',
    'hiszpania': 'Hiszpania',
    'holandia': 'Holandia',
    'tajwan': 'Tajwan',
    'chiny': 'Chiny',
    'japonia': 'Japonia',
    'indie': 'Indie',
    'tajlandia': 'Tajlandia',
    'turcja': 'Turcja',
    'szwecja': 'Szwecja',
    'dania': 'Dania',
    'norwegia': 'Norwegia',
    'finlandia': 'Finlandia',

    // Common variants
    'global': 'Globalny',
    'europe': 'Europa',
    'unknown': 'Nieznany',
};

/** Polish → English country name mapping */
const PL_TO_EN: Record<string, string> = {
    'Niemcy': 'Germany', 'Polska': 'Poland', 'Czechy': 'Czech Republic',
    'Słowacja': 'Slovakia', 'Węgry': 'Hungary', 'Austria': 'Austria',
    'Francja': 'France', 'Włochy': 'Italy', 'Hiszpania': 'Spain',
    'Holandia': 'Netherlands', 'Belgia': 'Belgium', 'Szwajcaria': 'Switzerland',
    'Wielka Brytania': 'United Kingdom', 'USA': 'USA', 'Kanada': 'Canada',
    'Chiny': 'China', 'Tajwan': 'Taiwan', 'Japonia': 'Japan',
    'Korea Południowa': 'South Korea', 'Indie': 'India', 'Tajlandia': 'Thailand',
    'Wietnam': 'Vietnam', 'Turcja': 'Turkey', 'Szwecja': 'Sweden',
    'Dania': 'Denmark', 'Norwegia': 'Norway', 'Finlandia': 'Finland',
    'Portugalia': 'Portugal', 'Rumunia': 'Romania', 'Bułgaria': 'Bulgaria',
    'Chorwacja': 'Croatia', 'Słowenia': 'Slovenia', 'Litwa': 'Lithuania',
    'Łotwa': 'Latvia', 'Estonia': 'Estonia', 'Irlandia': 'Ireland',
    'Luksemburg': 'Luxembourg', 'Meksyk': 'Mexico', 'Brazylia': 'Brazil',
    'Argentyna': 'Argentina', 'Australia': 'Australia', 'Nowa Zelandia': 'New Zealand',
    'RPA': 'South Africa', 'Malezja': 'Malaysia', 'Singapur': 'Singapore',
    'Indonezja': 'Indonesia', 'Filipiny': 'Philippines', 'Izrael': 'Israel',
    'ZEA': 'UAE', 'Arabia Saudyjska': 'Saudi Arabia', 'Ukraina': 'Ukraine',
    'Globalny': 'Global', 'Europa': 'Europe', 'Nieznany': 'Unknown',
    'Stany Zjednoczone': 'United States',
};

/** Normalize country name for a specific language */
export function normalizeCountryForLang(raw?: string | null, lang: string = 'pl'): string {
    const polishName = normalizeCountry(raw);
    if (lang === 'en') return PL_TO_EN[polishName] || polishName;
    return polishName;
}

/**
 * Maps standardized Polish country names to their official language ISO 639-1 codes.
 * Used for email translation — determines which language to translate outreach emails into.
 */
const COUNTRY_TO_LANGUAGE: Record<string, { code: string; name: string }> = {
    'Niemcy': { code: 'de', name: 'German' },
    'Austria': { code: 'de', name: 'German' },
    'Szwajcaria': { code: 'de', name: 'German' },
    'Francja': { code: 'fr', name: 'French' },
    'Belgia': { code: 'fr', name: 'French' },
    'Luksemburg': { code: 'fr', name: 'French' },
    'Włochy': { code: 'it', name: 'Italian' },
    'Hiszpania': { code: 'es', name: 'Spanish' },
    'Meksyk': { code: 'es', name: 'Spanish' },
    'Argentyna': { code: 'es', name: 'Spanish' },
    'Holandia': { code: 'nl', name: 'Dutch' },
    'Czechy': { code: 'cs', name: 'Czech' },
    'Słowacja': { code: 'sk', name: 'Slovak' },
    'Węgry': { code: 'hu', name: 'Hungarian' },
    'Portugalia': { code: 'pt', name: 'Portuguese' },
    'Brazylia': { code: 'pt', name: 'Portuguese' },
    'Rumunia': { code: 'ro', name: 'Romanian' },
    'Bułgaria': { code: 'bg', name: 'Bulgarian' },
    'Chorwacja': { code: 'hr', name: 'Croatian' },
    'Słowenia': { code: 'sl', name: 'Slovenian' },
    'Litwa': { code: 'lt', name: 'Lithuanian' },
    'Łotwa': { code: 'lv', name: 'Latvian' },
    'Estonia': { code: 'et', name: 'Estonian' },
    'Finlandia': { code: 'fi', name: 'Finnish' },
    'Szwecja': { code: 'sv', name: 'Swedish' },
    'Dania': { code: 'da', name: 'Danish' },
    'Norwegia': { code: 'no', name: 'Norwegian' },
    'Turcja': { code: 'tr', name: 'Turkish' },
    'Japonia': { code: 'ja', name: 'Japanese' },
    'Chiny': { code: 'zh', name: 'Chinese' },
    'Tajwan': { code: 'zh', name: 'Chinese' },
    'Korea Południowa': { code: 'ko', name: 'Korean' },
    'Indie': { code: 'en', name: 'English' },
    'Tajlandia': { code: 'th', name: 'Thai' },
    'Wietnam': { code: 'vi', name: 'Vietnamese' },
    'Indonezja': { code: 'id', name: 'Indonesian' },
    'Malezja': { code: 'ms', name: 'Malay' },
    'Filipiny': { code: 'en', name: 'English' },
    'Irlandia': { code: 'en', name: 'English' },
    'Wielka Brytania': { code: 'en', name: 'English' },
    'USA': { code: 'en', name: 'English' },
    'Kanada': { code: 'en', name: 'English' },
    'Australia': { code: 'en', name: 'English' },
    'Nowa Zelandia': { code: 'en', name: 'English' },
    'RPA': { code: 'en', name: 'English' },
    'Singapur': { code: 'en', name: 'English' },
    'Izrael': { code: 'he', name: 'Hebrew' },
    'ZEA': { code: 'en', name: 'English' },
    'Arabia Saudyjska': { code: 'ar', name: 'Arabic' },
    'Ukraina': { code: 'uk', name: 'Ukrainian' },
    'Polska': { code: 'pl', name: 'Polish' },
};

/**
 * Normalize a raw country value to a standardized Polish name.
 * Handles ISO codes, English names, Polish names, and common variants.
 *
 * @example
 *   normalizeCountry('DE')      → 'Niemcy'
 *   normalizeCountry('Germany') → 'Niemcy'
 *   normalizeCountry('PL')      → 'Polska'
 *   normalizeCountry('Taiwan')  → 'Tajwan'
 */
export function normalizeCountry(raw?: string | null): string {
    if (!raw) return 'Nieznany';

    const trimmed = raw.trim();
    if (!trimmed) return 'Nieznany';

    // Direct lookup (case-insensitive)
    const lower = trimmed.toLowerCase();
    if (COUNTRY_MAP[lower]) {
        return COUNTRY_MAP[lower];
    }

    // If the value already looks like a Polish name (starts with uppercase, > 3 chars)
    // and is not a code, return as-is
    if (trimmed.length > 3 && trimmed[0] === trimmed[0].toUpperCase()) {
        return trimmed;
    }

    return trimmed;
}

/**
 * Get the official language for a country (using normalized Polish country name).
 * Returns { code, name } where code is ISO 639-1 and name is English language name.
 * Defaults to English if country is unknown.
 *
 * @example
 *   getLanguageForCountry('Niemcy')  → { code: 'de', name: 'German' }
 *   getLanguageForCountry('Polska')  → { code: 'pl', name: 'Polish' }
 *   getLanguageForCountry('Unknown') → { code: 'en', name: 'English' }
 */
export function getLanguageForCountry(country?: string | null): { code: string; name: string } {
    if (!country) return { code: 'en', name: 'English' };

    const normalized = normalizeCountry(country);
    return COUNTRY_TO_LANGUAGE[normalized] || { code: 'en', name: 'English' };
}
