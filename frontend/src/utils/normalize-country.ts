/**
 * Country name normalization utility (frontend).
 * Converts ISO codes, English names, and common variants
 * to standardized country names (Polish or English based on isEN).
 */
import { isEN } from '@/i18n';

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
    if (!raw) return isEN ? 'Unknown' : 'Nieznany';
    const trimmed = raw.trim();
    if (!trimmed) return isEN ? 'Unknown' : 'Nieznany';

    const lower = trimmed.toLowerCase();
    const polishName = COUNTRY_MAP[lower] || (trimmed.length > 3 && trimmed[0] === trimmed[0].toUpperCase() ? trimmed : trimmed);

    if (isEN) return PL_TO_EN[polishName] || polishName;
    return polishName;
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
    // Always use Polish canonical name for flag lookup
    const lower = country.trim().toLowerCase();
    const polishName = COUNTRY_MAP[lower] || country.trim();
    return FLAG_MAP[polishName] || '🌍';
}
