import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../../common/services/gemini.service';
import { parseAiJson } from '../../common/utils/parse-ai-json';
import { ProductContext } from './screener.agent';

// Sanctioned countries — universal hard filter (Polish-normalized names)
export const SANCTIONED_COUNTRIES = new Set([
  'Rosja', 'Iran', 'Korea Północna', 'Syria', 'Białoruś',
  'Kuba', 'Myanmar', 'Wenezuela', 'Afganistan',
]);

// Region-specific language configurations
export const REGION_LANGUAGE_CONFIG: Record<string, {
  countries: string[];
  excludedCountries?: string[];
  allowedCountries?: string[];
  languages: { code: string; name: string; queryPrefix: string }[];
  searchSuffix: string[];
  negatives: string[];
}> = {
  // Poland only - Polish language
  PL: {
    countries: ['Poland'],
    allowedCountries: ['Polska'],
    languages: [
      { code: 'pl', name: 'Polish', queryPrefix: '' }
    ],
    searchSuffix: ['producent', 'zakład', 'fabryka'],
    negatives: ['-allegro', '-olx', '-sklep', '-hurtownia', '-ceneo', '-empik']
  },

  // United States - English only
  US: {
    countries: ['USA'],
    allowedCountries: ['USA', 'Stany Zjednoczone'],
    languages: [
      { code: 'en', name: 'English', queryPrefix: '' }
    ],
    searchSuffix: ['manufacturer', 'factory', 'producer', 'supplier'],
    negatives: ['-amazon', '-ebay', '-walmart', '-shop', '-store']
  },

  // United Kingdom - English only
  GB: {
    countries: ['UK'],
    allowedCountries: ['Wielka Brytania'],
    languages: [
      { code: 'en', name: 'English', queryPrefix: '' }
    ],
    searchSuffix: ['manufacturer', 'factory', 'producer', 'supplier'],
    negatives: ['-amazon', '-ebay', '-argos', '-shop', '-store']
  },

  // Canada - English + French
  CA: {
    countries: ['Canada'],
    allowedCountries: ['Kanada'],
    languages: [
      { code: 'en', name: 'English', queryPrefix: '' },
      { code: 'fr', name: 'French', queryPrefix: '' }
    ],
    searchSuffix: ['manufacturer', 'factory', 'producer', 'fabricant'],
    negatives: ['-amazon', '-ebay', '-shop', '-store']
  },

  // Australia - English only
  AU: {
    countries: ['Australia'],
    allowedCountries: ['Australia'],
    languages: [
      { code: 'en', name: 'English', queryPrefix: '' }
    ],
    searchSuffix: ['manufacturer', 'factory', 'producer', 'supplier'],
    negatives: ['-amazon', '-ebay', '-shop', '-store']
  },

  // China - Chinese + English
  CN: {
    countries: ['China'],
    allowedCountries: ['Chiny'],
    languages: [
      { code: 'zh', name: 'Chinese (Simplified)', queryPrefix: '' },
      { code: 'en', name: 'English', queryPrefix: '' }
    ],
    searchSuffix: ['manufacturer', 'factory', '\u5DE5\u5382', '\u5236\u9020\u5546', 'producer'],
    negatives: ['-amazon', '-ebay', '-shop', '-store']
  },

  // Europe - 12 major EU languages (economically weighted)
  EU: {
    countries: ['Germany', 'Poland', 'Czech Republic', 'France', 'Italy', 'Spain', 'Portugal', 'Netherlands', 'Belgium', 'Austria', 'Sweden', 'Romania', 'Denmark', 'Finland', 'Hungary', 'Ireland', 'Greece', 'Croatia'],
    allowedCountries: [
      'Niemcy', 'Polska', 'Czechy', 'Słowacja', 'Węgry', 'Austria', 'Francja',
      'Włochy', 'Hiszpania', 'Portugalia', 'Holandia', 'Belgia',
      'Szwecja', 'Rumunia', 'Dania', 'Finlandia',
      'Irlandia', 'Chorwacja', 'Słowenia', 'Bułgaria', 'Litwa', 'Łotwa',
      'Estonia', 'Luksemburg', 'Grecja', 'Cypr', 'Malta',
    ],
    languages: [
      { code: 'de', name: 'German', queryPrefix: '' },
      { code: 'pl', name: 'Polish', queryPrefix: '' },
      { code: 'cs', name: 'Czech', queryPrefix: '' },
      { code: 'fr', name: 'French', queryPrefix: '' },
      { code: 'it', name: 'Italian', queryPrefix: '' },
      { code: 'es', name: 'Spanish', queryPrefix: '' },
      { code: 'pt', name: 'Portuguese', queryPrefix: '' },
      { code: 'nl', name: 'Dutch', queryPrefix: '' },
      { code: 'en', name: 'English', queryPrefix: '' },
      { code: 'sv', name: 'Swedish', queryPrefix: '' },
      { code: 'ro', name: 'Romanian', queryPrefix: '' },
      { code: 'da', name: 'Danish', queryPrefix: '' },
    ],
    searchSuffix: ['manufacturer', 'Hersteller', 'producent', 'fabricant', 'fabbricante', 'fabricante', 'tillverkare', 'producător'],
    negatives: ['-amazon', '-ebay', '-alibaba', '-shop', '-store', '-allegro']
  },

  // Global without China — 25 languages, sanctioned countries excluded
  GLOBAL_NO_CN: {
    countries: ['USA', 'Germany', 'Japan', 'South Korea', 'India', 'Mexico', 'Brazil', 'UK', 'France', 'Italy', 'Poland', 'Taiwan', 'Vietnam', 'Thailand', 'Malaysia', 'Turkey', 'Czech Republic', 'Netherlands', 'Sweden', 'Switzerland', 'Austria', 'Indonesia', 'Spain', 'Portugal', 'Canada', 'Australia', 'Hungary', 'Romania', 'Denmark', 'Finland'],
    excludedCountries: ['CN', 'China', 'Chiny', 'Russia', 'Rosja', 'RU', 'Iran', 'IR', 'North Korea', 'Korea Północna', 'KP', 'Syria', 'SY', 'Afghanistan', 'Afganistan', 'AF', 'Cuba', 'Kuba', 'CU', 'Venezuela', 'VE', 'Myanmar', 'MM', 'Belarus', 'Białoruś', 'BY'],
    languages: [
      { code: 'en', name: 'English', queryPrefix: '' },
      { code: 'de', name: 'German', queryPrefix: '' },
      { code: 'ja', name: 'Japanese', queryPrefix: '' },
      { code: 'ko', name: 'Korean', queryPrefix: '' },
      { code: 'hi', name: 'Hindi', queryPrefix: '' },
      { code: 'es', name: 'Spanish', queryPrefix: '' },
      { code: 'pt', name: 'Portuguese', queryPrefix: '' },
      { code: 'pl', name: 'Polish', queryPrefix: '' },
      { code: 'fr', name: 'French', queryPrefix: '' },
      { code: 'it', name: 'Italian', queryPrefix: '' },
      { code: 'vi', name: 'Vietnamese', queryPrefix: '' },
      { code: 'th', name: 'Thai', queryPrefix: '' },
      { code: 'tr', name: 'Turkish', queryPrefix: '' },
      { code: 'id', name: 'Indonesian', queryPrefix: '' },
      { code: 'ms', name: 'Malay', queryPrefix: '' },
      { code: 'nl', name: 'Dutch', queryPrefix: '' },
      { code: 'sv', name: 'Swedish', queryPrefix: '' },
      { code: 'cs', name: 'Czech', queryPrefix: '' },
      { code: 'ro', name: 'Romanian', queryPrefix: '' },
      { code: 'hu', name: 'Hungarian', queryPrefix: '' },
      { code: 'da', name: 'Danish', queryPrefix: '' },
      { code: 'fi', name: 'Finnish', queryPrefix: '' },
      { code: 'ar', name: 'Arabic', queryPrefix: '' },
      { code: 'he', name: 'Hebrew', queryPrefix: '' },
      { code: 'el', name: 'Greek', queryPrefix: '' },
    ],
    searchSuffix: ['manufacturer', 'factory', 'producer', 'OEM supplier'],
    negatives: ['-amazon', '-ebay', '-alibaba', '-aliexpress', '-taobao', '-1688', '-shop', '-store', '-china', '-chinese']
  },

  // Global with China — 25+ languages, sanctioned countries excluded
  GLOBAL: {
    countries: ['USA', 'Germany', 'Japan', 'China', 'South Korea', 'India', 'Mexico', 'Brazil', 'UK', 'France', 'Italy', 'Poland', 'Taiwan', 'Vietnam', 'Thailand', 'Malaysia', 'Turkey', 'Czech Republic', 'Netherlands', 'Sweden', 'Switzerland', 'Austria', 'Indonesia', 'Spain', 'Portugal', 'Canada', 'Australia', 'Hungary', 'Romania', 'Denmark', 'Finland'],
    excludedCountries: ['Russia', 'Rosja', 'RU', 'Iran', 'IR', 'North Korea', 'Korea Północna', 'KP', 'Syria', 'SY', 'Afghanistan', 'Afganistan', 'AF', 'Cuba', 'Kuba', 'CU', 'Venezuela', 'VE', 'Myanmar', 'MM', 'Belarus', 'Białoruś', 'BY'],
    languages: [
      { code: 'en', name: 'English', queryPrefix: '' },
      { code: 'de', name: 'German', queryPrefix: '' },
      { code: 'ja', name: 'Japanese', queryPrefix: '' },
      { code: 'zh', name: 'Chinese (Simplified)', queryPrefix: '' },
      { code: 'ko', name: 'Korean', queryPrefix: '' },
      { code: 'hi', name: 'Hindi', queryPrefix: '' },
      { code: 'es', name: 'Spanish', queryPrefix: '' },
      { code: 'pt', name: 'Portuguese', queryPrefix: '' },
      { code: 'pl', name: 'Polish', queryPrefix: '' },
      { code: 'fr', name: 'French', queryPrefix: '' },
      { code: 'it', name: 'Italian', queryPrefix: '' },
      { code: 'vi', name: 'Vietnamese', queryPrefix: '' },
      { code: 'th', name: 'Thai', queryPrefix: '' },
      { code: 'tr', name: 'Turkish', queryPrefix: '' },
      { code: 'id', name: 'Indonesian', queryPrefix: '' },
      { code: 'ms', name: 'Malay', queryPrefix: '' },
      { code: 'nl', name: 'Dutch', queryPrefix: '' },
      { code: 'sv', name: 'Swedish', queryPrefix: '' },
      { code: 'cs', name: 'Czech', queryPrefix: '' },
      { code: 'ro', name: 'Romanian', queryPrefix: '' },
      { code: 'hu', name: 'Hungarian', queryPrefix: '' },
      { code: 'da', name: 'Danish', queryPrefix: '' },
      { code: 'fi', name: 'Finnish', queryPrefix: '' },
      { code: 'ar', name: 'Arabic', queryPrefix: '' },
      { code: 'he', name: 'Hebrew', queryPrefix: '' },
    ],
    searchSuffix: ['manufacturer', 'factory', 'producer', 'OEM supplier', '工厂', '制造商'],
    negatives: ['-amazon', '-ebay', '-shop', '-store']
  }
};

@Injectable()
export class StrategyAgentService {
  private readonly logger = new Logger(StrategyAgentService.name);

  // Country code → language mappings for CUSTOM region
  static readonly COUNTRY_LANGUAGES: Record<string, { languages: string[]; countryName: string; countryNamePL: string }> = {
    'PL': { languages: ['pl'], countryName: 'Poland', countryNamePL: 'Polska' },
    'DE': { languages: ['de'], countryName: 'Germany', countryNamePL: 'Niemcy' },
    'CZ': { languages: ['cs'], countryName: 'Czech Republic', countryNamePL: 'Czechy' },
    'SK': { languages: ['sk', 'cs'], countryName: 'Slovakia', countryNamePL: 'Słowacja' },
    'AT': { languages: ['de'], countryName: 'Austria', countryNamePL: 'Austria' },
    'FR': { languages: ['fr'], countryName: 'France', countryNamePL: 'Francja' },
    'IT': { languages: ['it'], countryName: 'Italy', countryNamePL: 'Włochy' },
    'ES': { languages: ['es'], countryName: 'Spain', countryNamePL: 'Hiszpania' },
    'PT': { languages: ['pt'], countryName: 'Portugal', countryNamePL: 'Portugalia' },
    'NL': { languages: ['nl'], countryName: 'Netherlands', countryNamePL: 'Holandia' },
    'BE': { languages: ['nl', 'fr'], countryName: 'Belgium', countryNamePL: 'Belgia' },
    'CH': { languages: ['de', 'fr'], countryName: 'Switzerland', countryNamePL: 'Szwajcaria' },
    'SE': { languages: ['sv'], countryName: 'Sweden', countryNamePL: 'Szwecja' },
    'DK': { languages: ['da'], countryName: 'Denmark', countryNamePL: 'Dania' },
    'NO': { languages: ['no'], countryName: 'Norway', countryNamePL: 'Norwegia' },
    'FI': { languages: ['fi'], countryName: 'Finland', countryNamePL: 'Finlandia' },
    'HU': { languages: ['hu'], countryName: 'Hungary', countryNamePL: 'Węgry' },
    'RO': { languages: ['ro'], countryName: 'Romania', countryNamePL: 'Rumunia' },
    'BG': { languages: ['bg'], countryName: 'Bulgaria', countryNamePL: 'Bułgaria' },
    'HR': { languages: ['hr'], countryName: 'Croatia', countryNamePL: 'Chorwacja' },
    'SI': { languages: ['sl'], countryName: 'Slovenia', countryNamePL: 'Słowenia' },
    'LT': { languages: ['lt'], countryName: 'Lithuania', countryNamePL: 'Litwa' },
    'LV': { languages: ['lv'], countryName: 'Latvia', countryNamePL: 'Łotwa' },
    'EE': { languages: ['et'], countryName: 'Estonia', countryNamePL: 'Estonia' },
    'IE': { languages: ['en'], countryName: 'Ireland', countryNamePL: 'Irlandia' },
    'GB': { languages: ['en'], countryName: 'United Kingdom', countryNamePL: 'Wielka Brytania' },
    'GR': { languages: ['el'], countryName: 'Greece', countryNamePL: 'Grecja' },
    'CN': { languages: ['zh'], countryName: 'China', countryNamePL: 'Chiny' },
    'JP': { languages: ['ja'], countryName: 'Japan', countryNamePL: 'Japonia' },
    'KR': { languages: ['ko'], countryName: 'South Korea', countryNamePL: 'Korea Południowa' },
    'IN': { languages: ['hi', 'en'], countryName: 'India', countryNamePL: 'Indie' },
    'TW': { languages: ['zh'], countryName: 'Taiwan', countryNamePL: 'Tajwan' },
    'HK': { languages: ['zh', 'en'], countryName: 'Hong Kong', countryNamePL: 'Hongkong' },
    'MO': { languages: ['zh', 'pt'], countryName: 'Macau', countryNamePL: 'Makao' },
    'VN': { languages: ['vi'], countryName: 'Vietnam', countryNamePL: 'Wietnam' },
    'TH': { languages: ['th'], countryName: 'Thailand', countryNamePL: 'Tajlandia' },
    'MY': { languages: ['ms'], countryName: 'Malaysia', countryNamePL: 'Malezja' },
    'ID': { languages: ['id'], countryName: 'Indonesia', countryNamePL: 'Indonezja' },
    'TR': { languages: ['tr'], countryName: 'Turkey', countryNamePL: 'Turcja' },
    'US': { languages: ['en'], countryName: 'USA', countryNamePL: 'USA' },
    'CA': { languages: ['en', 'fr'], countryName: 'Canada', countryNamePL: 'Kanada' },
    'MX': { languages: ['es'], countryName: 'Mexico', countryNamePL: 'Meksyk' },
    'BR': { languages: ['pt'], countryName: 'Brazil', countryNamePL: 'Brazylia' },
    'AU': { languages: ['en'], countryName: 'Australia', countryNamePL: 'Australia' },
    // Europa — dodatkowe
    'UA': { languages: ['uk'], countryName: 'Ukraine', countryNamePL: 'Ukraina' },
    'RS': { languages: ['sr'], countryName: 'Serbia', countryNamePL: 'Serbia' },
    'BA': { languages: ['bs', 'hr', 'sr'], countryName: 'Bosnia and Herzegovina', countryNamePL: 'Bośnia i Hercegowina' },
    'ME': { languages: ['sr'], countryName: 'Montenegro', countryNamePL: 'Czarnogóra' },
    'MK': { languages: ['mk'], countryName: 'North Macedonia', countryNamePL: 'Macedonia Północna' },
    'AL': { languages: ['sq'], countryName: 'Albania', countryNamePL: 'Albania' },
    'XK': { languages: ['sq', 'sr'], countryName: 'Kosovo', countryNamePL: 'Kosowo' },
    'MD': { languages: ['ro'], countryName: 'Moldova', countryNamePL: 'Mołdawia' },
    'CY': { languages: ['el', 'en'], countryName: 'Cyprus', countryNamePL: 'Cypr' },
    'MT': { languages: ['en'], countryName: 'Malta', countryNamePL: 'Malta' },
    'LU': { languages: ['fr', 'de'], countryName: 'Luxembourg', countryNamePL: 'Luksemburg' },
    'IS': { languages: ['is', 'en'], countryName: 'Iceland', countryNamePL: 'Islandia' },
    'GE': { languages: ['ka', 'en'], countryName: 'Georgia', countryNamePL: 'Gruzja' },
    'AM': { languages: ['hy', 'en'], countryName: 'Armenia', countryNamePL: 'Armenia' },
    'AZ': { languages: ['az', 'en'], countryName: 'Azerbaijan', countryNamePL: 'Azerbejdżan' },
    // Azja — dodatkowe
    'PH': { languages: ['en', 'fil'], countryName: 'Philippines', countryNamePL: 'Filipiny' },
    'SG': { languages: ['en', 'zh'], countryName: 'Singapore', countryNamePL: 'Singapur' },
    'BD': { languages: ['bn', 'en'], countryName: 'Bangladesh', countryNamePL: 'Bangladesz' },
    'PK': { languages: ['ur', 'en'], countryName: 'Pakistan', countryNamePL: 'Pakistan' },
    'LK': { languages: ['si', 'en'], countryName: 'Sri Lanka', countryNamePL: 'Sri Lanka' },
    'KH': { languages: ['km', 'en'], countryName: 'Cambodia', countryNamePL: 'Kambodża' },
    'NP': { languages: ['ne', 'en'], countryName: 'Nepal', countryNamePL: 'Nepal' },
    'MN': { languages: ['mn', 'en'], countryName: 'Mongolia', countryNamePL: 'Mongolia' },
    'KZ': { languages: ['kk', 'ru', 'en'], countryName: 'Kazakhstan', countryNamePL: 'Kazachstan' },
    'UZ': { languages: ['uz', 'en'], countryName: 'Uzbekistan', countryNamePL: 'Uzbekistan' },
    'AE': { languages: ['ar', 'en'], countryName: 'UAE', countryNamePL: 'Zjednoczone Emiraty Arabskie' },
    'SA': { languages: ['ar', 'en'], countryName: 'Saudi Arabia', countryNamePL: 'Arabia Saudyjska' },
    'IL': { languages: ['he', 'en'], countryName: 'Israel', countryNamePL: 'Izrael' },
    'JO': { languages: ['ar', 'en'], countryName: 'Jordan', countryNamePL: 'Jordania' },
    'LB': { languages: ['ar', 'fr', 'en'], countryName: 'Lebanon', countryNamePL: 'Liban' },
    'OM': { languages: ['ar', 'en'], countryName: 'Oman', countryNamePL: 'Oman' },
    'QA': { languages: ['ar', 'en'], countryName: 'Qatar', countryNamePL: 'Katar' },
    'BH': { languages: ['ar', 'en'], countryName: 'Bahrain', countryNamePL: 'Bahrajn' },
    'KW': { languages: ['ar', 'en'], countryName: 'Kuwait', countryNamePL: 'Kuwejt' },
    'IQ': { languages: ['ar', 'en'], countryName: 'Iraq', countryNamePL: 'Irak' },
    'LA': { languages: ['lo', 'en'], countryName: 'Laos', countryNamePL: 'Laos' },
    // Afryka
    'ZA': { languages: ['en', 'af'], countryName: 'South Africa', countryNamePL: 'RPA' },
    'EG': { languages: ['ar', 'en'], countryName: 'Egypt', countryNamePL: 'Egipt' },
    'MA': { languages: ['ar', 'fr'], countryName: 'Morocco', countryNamePL: 'Maroko' },
    'NG': { languages: ['en'], countryName: 'Nigeria', countryNamePL: 'Nigeria' },
    'KE': { languages: ['en', 'sw'], countryName: 'Kenya', countryNamePL: 'Kenia' },
    'TN': { languages: ['ar', 'fr'], countryName: 'Tunisia', countryNamePL: 'Tunezja' },
    'GH': { languages: ['en'], countryName: 'Ghana', countryNamePL: 'Ghana' },
    'ET': { languages: ['am', 'en'], countryName: 'Ethiopia', countryNamePL: 'Etiopia' },
    'TZ': { languages: ['sw', 'en'], countryName: 'Tanzania', countryNamePL: 'Tanzania' },
    'DZ': { languages: ['ar', 'fr'], countryName: 'Algeria', countryNamePL: 'Algieria' },
    'SN': { languages: ['fr'], countryName: 'Senegal', countryNamePL: 'Senegal' },
    'CI': { languages: ['fr'], countryName: 'Ivory Coast', countryNamePL: 'Wybrzeże Kości Słoniowej' },
    'CM': { languages: ['fr', 'en'], countryName: 'Cameroon', countryNamePL: 'Kamerun' },
    'UG': { languages: ['en', 'sw'], countryName: 'Uganda', countryNamePL: 'Uganda' },
    'MZ': { languages: ['pt'], countryName: 'Mozambique', countryNamePL: 'Mozambik' },
    'AO': { languages: ['pt'], countryName: 'Angola', countryNamePL: 'Angola' },
    'CD': { languages: ['fr'], countryName: 'DR Congo', countryNamePL: 'DR Konga' },
    'MG': { languages: ['mg', 'fr'], countryName: 'Madagascar', countryNamePL: 'Madagaskar' },
    'RW': { languages: ['rw', 'en', 'fr'], countryName: 'Rwanda', countryNamePL: 'Rwanda' },
    'ZM': { languages: ['en'], countryName: 'Zambia', countryNamePL: 'Zambia' },
    'ZW': { languages: ['en'], countryName: 'Zimbabwe', countryNamePL: 'Zimbabwe' },
    'BW': { languages: ['en'], countryName: 'Botswana', countryNamePL: 'Botswana' },
    'NA': { languages: ['en'], countryName: 'Namibia', countryNamePL: 'Namibia' },
    'MU': { languages: ['en', 'fr'], countryName: 'Mauritius', countryNamePL: 'Mauritius' },
    'LY': { languages: ['ar'], countryName: 'Libya', countryNamePL: 'Libia' },
    'ML': { languages: ['fr'], countryName: 'Mali', countryNamePL: 'Mali' },
    'BF': { languages: ['fr'], countryName: 'Burkina Faso', countryNamePL: 'Burkina Faso' },
    'NE': { languages: ['fr'], countryName: 'Niger', countryNamePL: 'Niger' },
    'MW': { languages: ['en'], countryName: 'Malawi', countryNamePL: 'Malawi' },
    // Ameryki — dodatkowe
    'AR': { languages: ['es'], countryName: 'Argentina', countryNamePL: 'Argentyna' },
    'CL': { languages: ['es'], countryName: 'Chile', countryNamePL: 'Chile' },
    'CO': { languages: ['es'], countryName: 'Colombia', countryNamePL: 'Kolumbia' },
    'PE': { languages: ['es'], countryName: 'Peru', countryNamePL: 'Peru' },
    'EC': { languages: ['es'], countryName: 'Ecuador', countryNamePL: 'Ekwador' },
    'UY': { languages: ['es'], countryName: 'Uruguay', countryNamePL: 'Urugwaj' },
    'PY': { languages: ['es'], countryName: 'Paraguay', countryNamePL: 'Paragwaj' },
    'BO': { languages: ['es'], countryName: 'Bolivia', countryNamePL: 'Boliwia' },
    'CR': { languages: ['es'], countryName: 'Costa Rica', countryNamePL: 'Kostaryka' },
    'PA': { languages: ['es'], countryName: 'Panama', countryNamePL: 'Panama' },
    'DO': { languages: ['es'], countryName: 'Dominican Republic', countryNamePL: 'Dominikana' },
    'GT': { languages: ['es'], countryName: 'Guatemala', countryNamePL: 'Gwatemala' },
    'HN': { languages: ['es'], countryName: 'Honduras', countryNamePL: 'Honduras' },
    'SV': { languages: ['es'], countryName: 'El Salvador', countryNamePL: 'Salwador' },
    'NI': { languages: ['es'], countryName: 'Nicaragua', countryNamePL: 'Nikaragua' },
    'JM': { languages: ['en'], countryName: 'Jamaica', countryNamePL: 'Jamajka' },
    'TT': { languages: ['en'], countryName: 'Trinidad and Tobago', countryNamePL: 'Trynidad i Tobago' },
    // Oceania — dodatkowe
    'NZ': { languages: ['en'], countryName: 'New Zealand', countryNamePL: 'Nowa Zelandia' },
    'FJ': { languages: ['en'], countryName: 'Fiji', countryNamePL: 'Fidżi' },
    'PG': { languages: ['en'], countryName: 'Papua New Guinea', countryNamePL: 'Papua Nowa Gwinea' },
  };

  private buildCustomRegionConfig(countryCodes: string[]) {
    const countries: string[] = [];
    const allowedCountries: string[] = [];
    const langSet = new Set<string>();

    for (const code of countryCodes) {
      const upperCode = code.toUpperCase();
      const info = StrategyAgentService.COUNTRY_LANGUAGES[upperCode] || StrategyAgentService.COUNTRY_LANGUAGES[code];
      if (info) {
        countries.push(info.countryName);
        allowedCountries.push(info.countryNamePL);
        info.languages.forEach(l => langSet.add(l));
      } else {
        this.logger.warn(`[STRATEGY] Unknown country code "${code}" in CUSTOM region — skipped. Available: ${Object.keys(StrategyAgentService.COUNTRY_LANGUAGES).length} codes.`);
      }
    }

    // CUSTOM region: use only languages of selected countries
    // EN added only as safety net if no languages found (shouldn't happen)
    if (langSet.size === 0) {
      langSet.add('en');
    }

    const languages = Array.from(langSet).map(code => ({
      code,
      name: code,
      queryPrefix: '',
    }));

    return {
      countries,
      allowedCountries,
      languages,
      searchSuffix: ['manufacturer', 'producer', 'factory', 'supplier'],
      negatives: ['-amazon', '-ebay', '-alibaba', '-shop', '-store'],
    };
  }

  constructor(private readonly geminiService: GeminiService) { }

  private buildIndustryModeBlock(ctx: {
    industry?: string;
    sourcingMode?: 'product' | 'service' | 'mixed';
    city?: string;
    eventDate?: string;
    headcount?: number;
    brief?: string;
    effectiveProductName: string;
    voivodeships?: string[];
    moq?: number;
    leadTimeWeeks?: number;
    sourcingGeography?: string;
    industrySubcategory?: string;
    eventType?: string;
    constructionStage?: string;
    horecaVenueType?: string;
    healthcareRegClass?: string;
    mroUrgency?: string;
    logisticsSla?: string;
    mfgTolerance?: string;
    retailBrandModel?: string;
  }): string {
    if (!ctx.industry && !ctx.sourcingMode && !ctx.city && !ctx.brief) {
      return '';
    }

    const INDUSTRY_GUIDANCE: Record<string, string> = {
      manufacturing: 'Szukamy PRODUCENTÓW surowców/komponentów/podzespołów dla B2B (nie sklepów, nie dystrybutorów gotowych wyrobów).',
      events: 'Szukamy LOKALNYCH WYKONAWCÓW USŁUG EVENTOWYCH (catering, AV, scenografia, hostessy) w konkretnym mieście i terminie. Zapytania MUSZĄ zawierać miasto.',
      construction: 'Szukamy PODWYKONAWCÓW BUDOWLANYCH (HVAC, elektryka, wykończenia) LUB dostawców materiałów budowlanych w konkretnym regionie/województwie.',
      horeca: 'Szukamy DOSTAWCÓW F&B, sprzętu kuchennego, serwisu urządzeń — preferuj lokalnych producentów nabiału/mięsa/warzyw i regionalnych hurtowników.',
      healthcare: 'Szukamy PRODUCENTÓW WYROBÓW MEDYCZNYCH z obowiązkową zgodnością (CE/MDR/FDA/ISO 13485). Odrzucaj dystrybutorów bez własnego znaku CE.',
      retail: 'Szukamy PRODUCENTÓW PRIVATE LABEL (nearshore lub offshore) gotowych produkować pod marką klienta — nie platform B2C ani sklepów.',
      logistics: 'Szukamy DOSTAWCÓW SPRZĘTU LOGISTYCZNEGO (regały, przenośniki, wózki) LUB operatorów 3PL z pokryciem geograficznym — nie kurierów detalicznych.',
      mro: 'Szukamy DOSTAWCÓW CZĘŚCI MRO / SERWISÓW UTRZYMANIA RUCHU — producenci łożysk, uszczelnień, komponentów + firmy serwisowe z SLA.',
      other: 'Brak profilu branżowego — bazuj na opisie i kontekście produktu.',
    };

    const MODE_GUIDANCE: Record<string, string> = {
      product: 'Szukaj PRODUCENTÓW/DOSTAWCÓW towaru. Używaj terminów: "producent", "manufacturer", "supplier", "factory", "Hersteller", "fournisseur".',
      service: 'Szukaj WYKONAWCÓW USŁUG (nie producentów towarów). Używaj terminów: "firma", "wykonawca", "usługi", "company", "contractor", "services", "Dienstleister", "entreprise".',
      mixed: 'Szukaj zarówno DOSTAWCÓW jak i WYKONAWCÓW — dopuszczalne obie kategorie keywords.',
    };

    const industryLine = ctx.industry ? `**BRANŻA:** ${ctx.industry}\n${INDUSTRY_GUIDANCE[ctx.industry] || INDUSTRY_GUIDANCE.other}` : '';
    const modeLine = ctx.sourcingMode ? `**TRYB SOURCINGU:** ${ctx.sourcingMode}\n${MODE_GUIDANCE[ctx.sourcingMode]}` : '';

    // Location specificity for events / construction
    const locationParts: string[] = [];
    if (ctx.city) {
      locationParts.push(`**MIASTO:** ${ctx.city} — zapytania MUSZĄ zawierać nazwę tego miasta (np. "catering ${ctx.city}", "AV services ${ctx.city}").`);
    }
    if (ctx.eventDate) locationParts.push(`**DATA WYDARZENIA:** ${ctx.eventDate}`);
    if (ctx.headcount) locationParts.push(`**SKALA WYDARZENIA:** ${ctx.headcount} osób — preferuj wykonawców o odpowiedniej pojemności.`);
    if (ctx.voivodeships?.length) {
      const voivMap: Record<string, string> = {
        DS: 'Dolnośląskie', KP: 'Kujawsko-pomorskie', LU: 'Lubelskie', LB: 'Lubuskie',
        LD: 'Łódzkie', MA: 'Małopolskie', MZ: 'Mazowieckie', OP: 'Opolskie',
        PK: 'Podkarpackie', PD: 'Podlaskie', PM: 'Pomorskie', SL: 'Śląskie',
        SK: 'Świętokrzyskie', WN: 'Warmińsko-mazurskie', WP: 'Wielkopolskie', ZP: 'Zachodniopomorskie',
      };
      const voivLabels = ctx.voivodeships.map(c => voivMap[c] || c).join(', ');
      locationParts.push(`**WOJEWÓDZTWA (PL):** ${voivLabels} — zawężaj do firm z tych regionów (np. "podwykonawca HVAC ${voivLabels.split(',')[0]}").`);
    }
    const locationBlock = locationParts.length ? `\n${locationParts.join('\n')}` : '';

    // Product-sourcing constraints — MOQ/lead time help strategy favor niches that match buyer's scale.
    const constraintParts: string[] = [];
    if (ctx.moq) constraintParts.push(`**MOQ (min. zamówienie):** ${ctx.moq} — preferuj dostawców akceptujących MOQ ≤ ${ctx.moq}.`);
    if (ctx.leadTimeWeeks) constraintParts.push(`**LEAD TIME:** max ${ctx.leadTimeWeeks} tygodni — odrzucaj dostawców z dłuższymi cyklami produkcji.`);
    if (ctx.sourcingGeography) {
      const geoNote: Record<string, string> = {
        nearshore: 'Preferuj PL, CZ, PT, IT, TR, RO — nearshore dla EU (niski MOQ, szybki lead time).',
        offshore: 'Preferuj CN, VN, IN — offshore (niska cena jednostkowa, wysokie MOQ, długi lead time).',
        mixed: 'Dopuść oba — nearshore i offshore; porównanie landed cost.',
      };
      constraintParts.push(`**GEOGRAFIA:** ${ctx.sourcingGeography}. ${geoNote[ctx.sourcingGeography] || ''}`);
    }
    const constraintsBlock = constraintParts.length ? `\n${constraintParts.join('\n')}` : '';

    // Per-industry subcategory + extra picker (event type, construction stage, MRO
    // urgency, etc.) — surface them so query generation reflects buyer's actual niche.
    const subcatParts: string[] = [];
    if (ctx.industrySubcategory) subcatParts.push(`**SPECJALIZACJA:** ${ctx.industrySubcategory} — buduj zapytania pod tę niszę, nie ogólną branżę.`);
    if (ctx.eventType) subcatParts.push(`**TYP WYDARZENIA:** ${ctx.eventType} (np. konferencja → catering biznesowy + AV; gala → catering high-end + scenografia).`);
    if (ctx.constructionStage) subcatParts.push(`**ETAP INWESTYCJI:** ${ctx.constructionStage} — dopasuj typ podwykonawcy/materiału do etapu.`);
    if (ctx.horecaVenueType) subcatParts.push(`**TYP OBIEKTU HoReCa:** ${ctx.horecaVenueType} — wolumen i częstotliwość dostaw zależą od typu.`);
    if (ctx.healthcareRegClass) subcatParts.push(`**KLASA REGULACYJNA:** ${ctx.healthcareRegClass} — wymóg notyfikacji i konkretnych certyfikatów rośnie z klasą.`);
    if (ctx.mroUrgency) {
      const urgNote: Record<string, string> = {
        emergency: 'EMERGENCY — linia stoi, priorytet to dystrybutorzy z magazynem na stanie, nie OEM z lead time.',
        priority: 'PRIORITY — kilka dni, akceptujemy aftermarket equivalents.',
        routine: 'ROUTINE — planowo, OEM lub kwalifikowani aftermarket.',
      };
      subcatParts.push(`**PILNOŚĆ MRO:** ${ctx.mroUrgency} — ${urgNote[ctx.mroUrgency] || ''}`);
    }
    if (ctx.logisticsSla) subcatParts.push(`**SLA LOGISTYCZNE:** ${ctx.logisticsSla} — wymagaj dostawców z deklaracją SLA.`);
    if (ctx.mfgTolerance) subcatParts.push(`**TOLERANCJA PRODUKCYJNA:** ${ctx.mfgTolerance} — preferuj producentów z udokumentowaną klasą jakości.`);
    if (ctx.retailBrandModel) subcatParts.push(`**MODEL BRANDOWANIA:** ${ctx.retailBrandModel} — private label/OEM filtruje innych dostawców niż reseller.`);
    const subcatBlock = subcatParts.length ? `\n${subcatParts.join('\n')}` : '';

    const briefBlock = ctx.brief ? `\n**ORYGINALNY BRIEF OD UŻYTKOWNIKA:**\n"${ctx.brief.slice(0, 600)}"` : '';

    return `
=== KONTEKST BRANŻY I TRYBU SOURCINGU ===
${industryLine}
${modeLine}${locationBlock}${constraintsBlock}${subcatBlock}${briefBlock}

`;
  }

  async execute(params: {
    productName: string;
    description: string;
    keywords: string[];
    category: string;
    material: string;
    region: string;
    eau: number;
    productContext?: ProductContext;
    targetCountries?: string[];
    excludedCountries?: string[];
    requiredCertificates?: string[];
    industry?: string;
    sourcingMode?: 'product' | 'service' | 'mixed';
    city?: string;
    eventDate?: string;
    headcount?: number;
    brief?: string;
    voivodeships?: string[];
    moq?: number;
    leadTimeWeeks?: number;
    sourcingGeography?: string;
  }): Promise<any> {
    this.logger.log(`Executing Strategy Agent for "${params.productName}" in region: ${params.region}`);

    // Get region configuration — CUSTOM builds dynamic config from selected countries
    let regionConfig;
    if (params.region === 'CUSTOM' && params.targetCountries?.length) {
      regionConfig = this.buildCustomRegionConfig(params.targetCountries);
    } else {
      regionConfig = REGION_LANGUAGE_CONFIG[params.region as keyof typeof REGION_LANGUAGE_CONFIG]
        || REGION_LANGUAGE_CONFIG.EU;
    }

    // Apply user-selected country exclusions to preset regions
    if (params.excludedCountries?.length && params.region !== 'CUSTOM') {
      const excludedNames = new Set<string>();
      const excludedNamesPL = new Set<string>();
      for (const code of params.excludedCountries) {
        const info = StrategyAgentService.COUNTRY_LANGUAGES[code];
        if (info) {
          excludedNames.add(info.countryName);
          excludedNamesPL.add(info.countryNamePL);
        }
      }

      // Filter countries and allowedCountries
      const filteredCountries = regionConfig.countries.filter((c: string) => !excludedNames.has(c));
      const filteredAllowed = (regionConfig.allowedCountries || []).filter((c: string) => !excludedNamesPL.has(c));

      // Recalculate languages — only keep languages needed for remaining countries
      const excludedSet = new Set(params.excludedCountries);
      const remainingLangCodes = new Set<string>();
      for (const [code, info] of Object.entries(StrategyAgentService.COUNTRY_LANGUAGES)) {
        if (!excludedSet.has(code)) {
          // Check if this country is in the region's allowed list
          if (filteredAllowed.length === 0 || filteredAllowed.includes(info.countryNamePL) || filteredCountries.includes(info.countryName)) {
            info.languages.forEach((l: string) => remainingLangCodes.add(l));
          }
        }
      }
      // Always keep EN if it was in original config (for international searches within remaining countries)
      if (regionConfig.languages.some((l: { code: string }) => l.code === 'en')) {
        remainingLangCodes.add('en');
      }

      regionConfig = {
        ...regionConfig,
        countries: filteredCountries,
        allowedCountries: filteredAllowed,
        languages: regionConfig.languages.filter((l: { code: string }) => remainingLangCodes.has(l.code)),
      };

      this.logger.log(`[STRATEGY] Applied exclusions: removed ${params.excludedCountries.join(', ')} → ${filteredCountries.length} countries, ${regionConfig.languages.length} languages remaining`);
    }

    const languageInstructions = regionConfig.languages
      .map(l => `- ${l.name} (${l.code})`)
      .join('\n');

    const targetCountries = regionConfig.countries.join(', ');
    const negativeKeywords = regionConfig.negatives.join(' ');

    // Build rich product context
    const keywordsStr = params.keywords.length > 0 ? params.keywords.join(', ') : 'brak';
    const categoryStr = params.category || 'nie podano';
    const materialStr = params.material || 'nie podano';

    // Build product context block for strategy prompt
    let productContextBlock = '';
    const pc = params.productContext;
    if (pc) {
      const translationsBlock = Object.entries(pc.productTranslations || {})
        .map(([lang, translation]) => `  - ${lang}: "${translation}"`)
        .join('\n');

      productContextBlock = `
=== KONTEKST PRODUKTU (KRYTYCZNY — przeczytaj przed generowaniem zapytań) ===
PRODUKT DOCELOWY: ${pc.coreProduct}
KATEGORIA: ${pc.productCategory}
UWAGA: ${pc.disambiguationNote}

SYGNAŁY POZYTYWNE (szukaj firm z tymi terminami):
${pc.positiveSignals.map(s => `  ✅ ${s}`).join('\n')}

SYGNAŁY NEGATYWNE (UNIKAJ firm z tymi terminami — to firmy UŻYWAJĄCE produktu, nie produkujące go):
${pc.negativeSignals.map(s => `  ❌ ${s}`).join('\n')}

WAŻNE: NIE dodawaj negatywnych sygnałów jako "-keyword" do zapytań Google!
Zapytania powinny być POZYTYWNE — szukaj producentów, nie filtruj nadmiernie.
Negatywne sygnały służą jedynie Tobie do zrozumienia kontekstu i unikania złych kierunków.

TŁUMACZENIA PRODUKTU (użyj tych zamiast samodzielnego tłumaczenia):
${translationsBlock || '  (brak — przetłumacz samodzielnie)'}
`;
    }

    // Use clean product name from context when available (avoids "Kampania:" prefix leaking)
    const effectiveProductName = pc ? pc.coreProduct : params.productName;

    // Build certificates block
    const requiredCerts = params.requiredCertificates || [];
    const certificatesBlock = requiredCerts.length > 0
      ? `\n=== WYMAGANE CERTYFIKATY ===\nUżytkownik wymaga: ${requiredCerts.join(', ')}\nGeneruj DODATKOWE zapytania z certyfikatami, np.:\n"${requiredCerts[0]} ${effectiveProductName} manufacturer"\n"${effectiveProductName} supplier certified ${requiredCerts.join(' ')}"`
      : '';

    // Industry + sourcing mode context (wizard v2)
    const industryModeBlock = this.buildIndustryModeBlock({
      industry: params.industry,
      sourcingMode: params.sourcingMode,
      city: params.city,
      eventDate: params.eventDate,
      headcount: params.headcount,
      brief: params.brief,
      effectiveProductName,
      voivodeships: params.voivodeships,
      moq: params.moq,
      leadTimeWeeks: params.leadTimeWeeks,
      sourcingGeography: params.sourcingGeography,
      industrySubcategory: (params as any).industrySubcategory,
      eventType: (params as any).eventType,
      constructionStage: (params as any).constructionStage,
      horecaVenueType: (params as any).horecaVenueType,
      healthcareRegClass: (params as any).healthcareRegClass,
      mroUrgency: (params as any).mroUrgency,
      logisticsSla: (params as any).logisticsSla,
      mfgTolerance: (params as any).mfgTolerance,
      retailBrandModel: (params as any).retailBrandModel,
    });

    const systemPrompt = `
Jesteś Ekspertem Strategii Sourcingu Przemysłowego (Industrial Sourcing Strategist).
Twoim celem jest znalezienie JAK NAJWIĘKSZEJ LICZBY REALNYCH PRODUCENTÓW/WYKONAWCÓW dla podanego produktu lub usługi.
CHCEMY ZNALEŹĆ 200-300 DOSTAWCÓW w wybranym regionie. GENERUJ MAKSYMALNĄ LICZBĘ UNIKALNYCH ZAPYTAŃ.
${industryModeBlock}${productContextBlock}
=== PRODUKT / SUROWIEC / USŁUGA DO ZNALEZIENIA ===
**NAZWA:** "${effectiveProductName}"
**OPIS:** "${params.description}"
**SŁOWA KLUCZOWE:** ${keywordsStr}
**KATEGORIA:** ${categoryStr}
**MATERIAŁ:** ${materialStr}
**SKALA (EAU):** ${params.eau} szt./rok
**REGION:** ${params.region}
${certificatesBlock}

WAŻNE — ZROZUM INTENCJĘ UŻYTKOWNIKA:
Użytkownik szuka PRODUCENTÓW/DOSTAWCÓW produktu "${effectiveProductName}".
NIE szukaj dosłownie pełnej nazwy w cudzysłowach — to zbyt wąskie i znajdziesz głównie artykuły.
ZAMIAST TEGO generuj zapytania na RÓŻNYCH POZIOMACH SZCZEGÓŁOWOŚCI:
- DOKŁADNE: pełna nazwa produktu (np. "granulat HDPE virgin producent")
- OGÓLNE: szersza kategoria (np. "HDPE producent", "granulat tworzywowy dostawca")
- SYNONIMOWE: inne nazwy tego samego (np. "HDPE pellets manufacturer", "HDPE resin supplier")
- MATERIAŁOWE: sam materiał + typ dostawcy (np. "HDPE manufacturer Europe")

Jeśli produkt to surowiec (np. "aluminium ekstrudowane", "granulat HDPE"), szukaj PRODUCENTÓW/DOSTAWCÓW tego surowca,
a NIE producentów gotowych wyrobów z tego materiału.

=== OGRANICZENIE REGIONALNE ===
Twoje zapytania MUSZĄ być ograniczone do następujących krajów:
${targetCountries}

Używaj następujących JĘZYKÓW w zapytaniach:
${languageInstructions}

=== KRYTYCZNE WYMAGANIA ===
1. **Generuj 30-50 zapytań PER JĘZYK/KRAJ** (twardy minimum 30, optymalnie 40-50).
   To jest cel pokrycia 80-250 firm na shortlist. Mniej zapytań = mniejsza shortlist.
2. Zapytania muszą być powiązane z "${effectiveProductName}" — ale na RÓŻNYCH poziomach szczegółowości!
3. Używaj WSZYSTKICH poniższych typów strategii dla każdego języka (zaplanuj ~5-8 zapytań na typ):
   - DOKŁADNA: pełna nazwa produktu + producent/manufacturer
   - OGÓLNA: szersza kategoria produktu + producent (np. samo "HDPE" zamiast "HDPE virgin granulat")
   - SYNONIMOWA: synonimy i warianty nazwy (pellets, granules, resin, compound, kompozyt, material)
   - CHEMICZNA: nazwa IUPAC, INN, CAS-number (jeśli farma/chemia), formuła
   - TECHNOLOGICZNA: proces produkcyjny / technologia / metoda syntezy
   - KATALOGOWA: "lista producentów" / "list of manufacturers" / "directory of"
   - CERTYFIKACYJNA: certyfikaty + produkt + producent (GMP, ISO, FDA, etc.)
   - BRANŻOWA: targi branżowe / industrial fair + exhibitor list
   - KATALOG B2B: europages, kompass, thomasnet, wlw.de, alibaba, made-in-china
   - SUROWCOWA: dostawca surowca / raw material supplier / API supplier
   - STOWARZYSZENIOWA: lista członków stowarzyszenia branżowego
   - TARGOWA: "lista wystawców" / "exhibitor list" + targi branżowe + 2024 OR 2025 OR 2026
   - EKSPORTOWA: "baza eksporterów" / "export directory" + kraj
   - ŁAŃCUCH DOSTAW: "nasi dostawcy" / "our suppliers" / "approved vendors"
   - REGIONALNA: prowincja/region wewnątrz kraju + producent (np. "Zhejiang API manufacturer")
   - SUBKATEGORIA: warianty molekuły / typu produktu (różne soles, izomery, gatunki)
4. Dla każdego kraju generuj zapytania w LOKALNYM JĘZYKU + 30% w angielskim (international SEO)
5. LIMIT: max 15 krajów/języków dla EU, max 30 dla GLOBAL (wybierz najważniejsze gospodarczo)
6. NIE opakowuj nazwy produktu w cudzysłowy ("") w zapytaniach — to zbyt restrykcyjne!

KRYTYCZNE ZASADY:
1. Zapytania powinny zawierać nazwę produktu (lub synonim/ogólniejszy termin) + słowo producent/manufacturer/Hersteller/制造商
2. Generuj zapytania na RÓŻNYCH poziomach szczegółowości — od dokładnych po ogólne
3. Dodaj negatywne słowa kluczowe: ${negativeKeywords}
4. **MINIMUM 30 queries per kraj** — preferowane 40-50. Każde unikalne, pokrywające INNY typ strategii.
5. WYKLUCZ kraje objęte sankcjami: Rosja, Iran, Korea Północna, Syria, Afganistan, Kuba, Wenezuela, Myanmar, Białoruś
6. Dla KAŻDEGO kraju musisz mieć przynajmniej po 2 zapytania z typów: TARGOWA, STOWARZYSZENIOWA, KATALOG B2B, ŁAŃCUCH DOSTAW, CHEMICZNA, REGIONALNA

Output Format (JSON Only):
{
  "rationale": "Krótkie uzasadnienie strategii, nawiązanie do konkretnego produktu",
  "region_selected": "${params.region}",
  "languages_used": ["pl", "de", "en", ...],
  "strategies": [
    {
      "country": "Poland",
      "language": "pl",
      "queries": [
        "producent ${effectiveProductName} Polska",
        "dostawca ${effectiveProductName}",
        "fabryka ${effectiveProductName} Europa"
      ],
      "negatives": ["-allegro", "-olx", "-sklep", "-hurtownia"]
    }
  ]
}
    `;

    try {
      this.logger.log(`[STRATEGY] Calling Gemini API with prompt length: ${systemPrompt.length} chars`);
      const responseText = await this.geminiService.generateContent(systemPrompt);
      this.logger.log(`[STRATEGY] Gemini API response length: ${responseText.length} chars`);

      this.logger.log(`[STRATEGY] Raw response length: ${responseText.length} chars`);

      const result = parseAiJson(responseText);
      this.logger.log(`Strategy Agent generated ${result.strategies?.length || 0} country strategies`);

      if (!result.strategies || result.strategies.length === 0) {
        this.logger.error(`[STRATEGY] No strategies generated! Full response: ${JSON.stringify(result).substring(0, 500)}`);
      }

      // POST-PROCESSING: Filter strategies to only allowed languages from region config
      // Normalize language codes: "en-US" → "en", "pt-BR" → "pt"
      const allowedLanguages = new Set(regionConfig.languages.map(l => l.code));
      if (result.strategies && result.strategies.length > 0) {
        // Normalize Gemini's language codes before filtering
        for (const s of result.strategies) {
          if (s.language) s.language = s.language.split('-')[0].toLowerCase();
        }
        const before = result.strategies.length;
        result.strategies = result.strategies.filter((s: any) =>
          allowedLanguages.has(s.language)
        );
        const filtered = before - result.strategies.length;
        if (filtered > 0) {
          this.logger.warn(
            `[STRATEGY] Filtered out ${filtered} strategies with unauthorized languages ` +
            `(allowed: [${Array.from(allowedLanguages).join(', ')}])`
          );
        }
      }

      // POST-PROCESSING: Filter strategies to only allowed countries from region config
      if (result.strategies?.length > 0 && regionConfig.countries?.length > 0) {
        const normalizeForMatch = (name: string) => {
          const lower = name.toLowerCase().trim();
          const aliases: Record<string, string> = {
            'czechia': 'czech republic', 'the czech republic': 'czech republic', 'czech': 'czech republic',
            'the netherlands': 'netherlands', 'holland': 'netherlands',
            'united states': 'usa', 'united states of america': 'usa', 'u.s.a.': 'usa', 'u.s.': 'usa',
            'united kingdom': 'uk', 'great britain': 'uk', 'england': 'uk',
            'republic of korea': 'south korea', 'korea': 'south korea', 'korea (south)': 'south korea',
            'republic of türkiye': 'turkey', 'türkiye': 'turkey', 'turkiye': 'turkey',
            'brasil': 'brazil',
            'republic of india': 'india',
            'taiwan, province of china': 'taiwan', 'chinese taipei': 'taiwan',
            'viet nam': 'vietnam',
          };
          return aliases[lower] || lower;
        };
        const allowedCountrySet = new Set(regionConfig.countries.map((c: string) => normalizeForMatch(c)));
        const beforeCountry = result.strategies.length;
        result.strategies = result.strategies.filter((s: any) =>
          allowedCountrySet.has(normalizeForMatch(s.country || ''))
        );
        const filteredCountry = beforeCountry - result.strategies.length;
        if (filteredCountry > 0) {
          this.logger.warn(
            `[STRATEGY] Filtered out ${filteredCountry} strategies for unauthorized countries ` +
            `(allowed: [${regionConfig.countries.join(', ')}])`
          );
        }
      }

      // POST-PROCESSING: Augment each strategy with specialized query templates
      // These ensure coverage of search verticals that Gemini might miss
      if (result.strategies && result.strategies.length > 0) {
        const pc = params.productContext;
        const translations = pc?.productTranslations || {};

        for (const strategy of result.strategies) {
          const lang = strategy.language || 'en';
          const localProduct = translations[lang] || effectiveProductName;
          const countryName = strategy.country || '';

          const specializedQueries = [
            // Trade show exhibitor lists (no exact match quotes on product name)
            `${localProduct} exhibitor list ${countryName}`,
            // Industry association member lists
            `${localProduct} association members ${countryName}`,
            // "Our suppliers" / supply chain pages
            `${localProduct} "our suppliers" OR "approved vendors"`,
            // B2B directory targeted searches
            `site:europages.com ${localProduct} ${countryName}`,
            `site:kompass.com ${localProduct} ${countryName}`,
            // Certification registries (TÜV, DNV, Bureau Veritas)
            `${localProduct} "ISO 9001" certificate holder ${countryName}`,
            `site:tuv.com ${localProduct} certified ${countryName}`,
            // OEM manufacturer search
            `${localProduct} OEM manufacturer ${countryName}`,
            // Industry news — find companies investing/expanding
            `${localProduct} manufacturer new factory OR expansion ${countryName} 2025 OR 2026`,
            // Regional B2B directories (WLW for DACH, ThomasNet for US)
            ...(lang === 'de' ? [`site:wlw.de ${localProduct} hersteller`] : []),
            ...(lang === 'en' ? [`site:thomasnet.com ${localProduct} manufacturer`] : []),
          ];

          // Add certificate-based queries if user specified required certs
          if (requiredCerts.length > 0) {
            for (const cert of requiredCerts.slice(0, 3)) {
              specializedQueries.push(`${cert} ${localProduct} manufacturer ${countryName}`);
              specializedQueries.push(`${localProduct} supplier certified ${cert} ${countryName}`);
            }
          }

          // Add alternative product names from context (without exact-match quotes)
          if (pc?.alternativeNames) {
            for (const altName of pc.alternativeNames.slice(0, 5)) {
              specializedQueries.push(`${altName} manufacturer ${countryName}`);
              specializedQueries.push(`${altName} supplier producer ${countryName}`);
            }
          }

          // Add trade show queries from context
          if (pc?.majorTradeShows) {
            for (const show of pc.majorTradeShows.slice(0, 2)) {
              specializedQueries.push(`"${show}" exhibitor "${localProduct}"`);
            }
          }

          // Add association queries from context
          if (pc?.industryAssociations) {
            for (const assoc of pc.industryAssociations.slice(0, 2)) {
              specializedQueries.push(`"${assoc}" member list`);
            }
          }

          // Deduplicate: only add queries not already present
          const existingSet = new Set(strategy.queries.map((q: string) => q.toLowerCase().trim()));
          for (const sq of specializedQueries) {
            const normalized = sq.toLowerCase().trim();
            if (!existingSet.has(normalized)) {
              strategy.queries.push(sq);
              existingSet.add(normalized);
            }
          }

          this.logger.log(`[STRATEGY] Augmented ${countryName}/${lang}: ${strategy.queries.length} total queries`);
        }
      }

      return result;
    } catch (e) {
      this.logger.error(`[STRATEGY] Failed to execute Strategy Agent: ${e.message}`);
      this.logger.error(`[STRATEGY] Error stack: ${e.stack}`);
      this.logger.error(`[STRATEGY] Full error object: ${JSON.stringify(e, null, 2)}`);
      return { error: e.message, strategies: [] };
    }
  }
}
