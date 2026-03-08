/**
 * Country name normalization utility (frontend).
 * Converts ISO codes, English names, and common variants
 * to standardized Polish country names.
 */

const COUNTRY_MAP: Record<string, string> = {
    // ISO 2-letter codes
    de: 'Niemcy', pl: 'Polska', cz: 'Czechy', sk: 'Słowacja', hu: 'Węgry',
    at: 'Austria', fr: 'Francja', it: 'Włochy', es: 'Hiszpania', nl: 'Holandia',
    be: 'Belgia', ch: 'Szwajcaria', gb: 'Wielka Brytania', uk: 'Wielka Brytania',
    us: 'USA', ca: 'Kanada', cn: 'Chiny', tw: 'Tajwan', jp: 'Japonia',
    kr: 'Korea Południowa', in: 'Indie', th: 'Tajlandia', vn: 'Wietnam',
    tr: 'Turcja', se: 'Szwecja', dk: 'Dania', no: 'Norwegia', fi: 'Finlandia',
    pt: 'Portugalia', ro: 'Rumunia', bg: 'Bułgaria', hr: 'Chorwacja',
    si: 'Słowenia', lt: 'Litwa', lv: 'Łotwa', ee: 'Estonia', ie: 'Irlandia',
    lu: 'Luksemburg', mx: 'Meksyk', br: 'Brazylia', ar: 'Argentyna',
    au: 'Australia', nz: 'Nowa Zelandia', za: 'RPA', my: 'Malezja',
    sg: 'Singapur', id: 'Indonezja', ph: 'Filipiny', il: 'Izrael',
    ae: 'ZEA', sa: 'Arabia Saudyjska', ua: 'Ukraina',

    // English names → Polish
    germany: 'Niemcy', poland: 'Polska', 'czech republic': 'Czechy',
    czechia: 'Czechy', slovakia: 'Słowacja', hungary: 'Węgry',
    austria: 'Austria', france: 'Francja', italy: 'Włochy', spain: 'Hiszpania',
    netherlands: 'Holandia', 'the netherlands': 'Holandia', belgium: 'Belgia',
    switzerland: 'Szwajcaria', 'united kingdom': 'Wielka Brytania',
    'great britain': 'Wielka Brytania', england: 'Wielka Brytania',
    'united states': 'USA', 'united states of america': 'USA', usa: 'USA',
    canada: 'Kanada', china: 'Chiny', taiwan: 'Tajwan', japan: 'Japonia',
    'south korea': 'Korea Południowa', korea: 'Korea Południowa',
    india: 'Indie', thailand: 'Tajlandia', vietnam: 'Wietnam',
    turkey: 'Turcja', 'türkiye': 'Turcja', sweden: 'Szwecja',
    denmark: 'Dania', norway: 'Norwegia', finland: 'Finlandia',
    portugal: 'Portugalia', romania: 'Rumunia', bulgaria: 'Bułgaria',
    croatia: 'Chorwacja', slovenia: 'Słowenia', lithuania: 'Litwa',
    latvia: 'Łotwa', estonia: 'Estonia', ireland: 'Irlandia',
    luxembourg: 'Luksemburg', mexico: 'Meksyk', brazil: 'Brazylia',
    argentina: 'Argentyna', australia: 'Australia', 'new zealand': 'Nowa Zelandia',
    'south africa': 'RPA', malaysia: 'Malezja', singapore: 'Singapur',
    indonesia: 'Indonezja', philippines: 'Filipiny', israel: 'Izrael',
    'united arab emirates': 'ZEA', 'saudi arabia': 'Arabia Saudyjska',
    ukraine: 'Ukraina',

    // Polish pass-through
    niemcy: 'Niemcy', polska: 'Polska', czechy: 'Czechy', francja: 'Francja',
    włochy: 'Włochy', hiszpania: 'Hiszpania', holandia: 'Holandia',
    tajwan: 'Tajwan', chiny: 'Chiny', japonia: 'Japonia', indie: 'Indie',
    tajlandia: 'Tajlandia', turcja: 'Turcja', szwecja: 'Szwecja',
    dania: 'Dania', norwegia: 'Norwegia', finlandia: 'Finlandia',

    // Fallback
    global: 'Globalny', europe: 'Europa', unknown: 'Nieznany',
};

export function normalizeCountry(raw?: string | null): string {
    if (!raw) return 'Nieznany';
    const trimmed = raw.trim();
    if (!trimmed) return 'Nieznany';

    const lower = trimmed.toLowerCase();
    if (COUNTRY_MAP[lower]) return COUNTRY_MAP[lower];

    // If already looks like a proper name, return as-is
    if (trimmed.length > 3 && trimmed[0] === trimmed[0].toUpperCase()) return trimmed;

    return trimmed;
}

/** Map a country name (Polish or English) to a flag emoji */
const FLAG_MAP: Record<string, string> = {
    'Niemcy': '🇩🇪', 'Polska': '🇵🇱', 'Czechy': '🇨🇿', 'Słowacja': '🇸🇰',
    'Węgry': '🇭🇺', 'Austria': '🇦🇹', 'Francja': '🇫🇷', 'Włochy': '🇮🇹',
    'Hiszpania': '🇪🇸', 'Holandia': '🇳🇱', 'Belgia': '🇧🇪', 'Szwajcaria': '🇨🇭',
    'Wielka Brytania': '🇬🇧', 'USA': '🇺🇸', 'Kanada': '🇨🇦', 'Chiny': '🇨🇳',
    'Tajwan': '🇹🇼', 'Japonia': '🇯🇵', 'Korea Południowa': '🇰🇷', 'Indie': '🇮🇳',
    'Tajlandia': '🇹🇭', 'Wietnam': '🇻🇳', 'Turcja': '🇹🇷', 'Szwecja': '🇸🇪',
    'Dania': '🇩🇰', 'Norwegia': '🇳🇴', 'Finlandia': '🇫🇮', 'Portugalia': '🇵🇹',
    'Rumunia': '🇷🇴', 'Bułgaria': '🇧🇬', 'Chorwacja': '🇭🇷', 'Słowenia': '🇸🇮',
    'Litwa': '🇱🇹', 'Łotwa': '🇱🇻', 'Estonia': '🇪🇪', 'Irlandia': '🇮🇪',
    'Luksemburg': '🇱🇺', 'Meksyk': '🇲🇽', 'Brazylia': '🇧🇷', 'Argentyna': '🇦🇷',
    'Australia': '🇦🇺', 'Nowa Zelandia': '🇳🇿', 'RPA': '🇿🇦', 'Malezja': '🇲🇾',
    'Singapur': '🇸🇬', 'Indonezja': '🇮🇩', 'Filipiny': '🇵🇭', 'Izrael': '🇮🇱',
    'ZEA': '🇦🇪', 'Arabia Saudyjska': '🇸🇦', 'Ukraina': '🇺🇦',
};

export function getCountryFlag(country?: string): string {
    if (!country) return '🌍';
    const normalized = normalizeCountry(country);
    return FLAG_MAP[normalized] || '🌍';
}
