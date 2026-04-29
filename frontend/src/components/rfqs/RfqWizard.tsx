import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Loader2, Mail, HelpCircle, Globe2, X, Search, FileText,
  Factory, PartyPopper, HardHat, UtensilsCrossed, Stethoscope, ShoppingBag, Truck, Wrench, MoreHorizontal,
  Package, Briefcase, Sparkles, Rocket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TagInput } from '@/components/ui/tag-input';
import { FileUpload } from '@/components/ui/file-upload';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useCreateCampaign } from '@/hooks/useCampaigns';
import { t, isEN } from '@/i18n';
import { toast } from 'sonner';
import { EmailPreview } from '@/components/email/EmailPreview';
import { sequencesService, type SequenceTemplate } from '@/services/sequences.service';
import { organizationService } from '@/services/organization.service';
import type { DocumentRecord } from '@/services/documents.service';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { analytics, startHesitationTracker } from '@/lib/analytics';
import type { CreateCampaignDto, OrganizationLocation, Region, Industry, SourcingMode, ParsedBrief } from '@/types/campaign.types';
import { AVAILABLE_COUNTRIES } from '@/constants/countries';
import { campaignsService } from '@/services/campaigns.service';

// ─── Constants ─────────────────────────────────────────────────────────────

const INDUSTRY_OPTIONS: Industry[] = [
  'manufacturing', 'events', 'construction', 'horeca',
  'healthcare', 'retail', 'logistics', 'mro', 'other',
];

const INDUSTRY_ICON: Record<Industry, typeof Factory> = {
  manufacturing: Factory,
  events: PartyPopper,
  construction: HardHat,
  horeca: UtensilsCrossed,
  healthcare: Stethoscope,
  retail: ShoppingBag,
  logistics: Truck,
  mro: Wrench,
  other: MoreHorizontal,
};

// PL voivodeships — Construction needs site-level locality.
export const PL_VOIVODESHIPS: { code: string; labelPl: string; labelEn: string }[] = [
  { code: 'DS', labelPl: 'Dolnośląskie', labelEn: 'Lower Silesia' },
  { code: 'KP', labelPl: 'Kujawsko-pomorskie', labelEn: 'Kuyavia-Pomerania' },
  { code: 'LU', labelPl: 'Lubelskie', labelEn: 'Lublin' },
  { code: 'LB', labelPl: 'Lubuskie', labelEn: 'Lubusz' },
  { code: 'LD', labelPl: 'Łódzkie', labelEn: 'Łódź' },
  { code: 'MA', labelPl: 'Małopolskie', labelEn: 'Lesser Poland' },
  { code: 'MZ', labelPl: 'Mazowieckie', labelEn: 'Masovia' },
  { code: 'OP', labelPl: 'Opolskie', labelEn: 'Opole' },
  { code: 'PK', labelPl: 'Podkarpackie', labelEn: 'Subcarpathia' },
  { code: 'PD', labelPl: 'Podlaskie', labelEn: 'Podlasie' },
  { code: 'PM', labelPl: 'Pomorskie', labelEn: 'Pomerania' },
  { code: 'SL', labelPl: 'Śląskie', labelEn: 'Silesia' },
  { code: 'SK', labelPl: 'Świętokrzyskie', labelEn: 'Holy Cross' },
  { code: 'WN', labelPl: 'Warmińsko-mazurskie', labelEn: 'Warmia-Masuria' },
  { code: 'WP', labelPl: 'Wielkopolskie', labelEn: 'Greater Poland' },
  { code: 'ZP', labelPl: 'Zachodniopomorskie', labelEn: 'West Pomerania' },
];

// Industry → recommended certs. `required` is pre-ticked + flagged "obligatory for branch".
// Fixed (Sprint 3): logistics suggested cleaned up — GDP/ISO 14001 were unsourced; AEO is the
// only customs-cross-border cert that consistently matters in landing copy.
export const INDUSTRY_CERTIFICATES: Record<Industry, { required: string[]; suggested: string[] }> = {
  manufacturing: { required: [], suggested: ['ISO 9001', 'ISO 14001', 'IATF 16949', 'AS9100', 'RoHS', 'REACH', 'CE'] },
  events: { required: [], suggested: ['HACCP', 'ISO 22000'] },
  construction: { required: [], suggested: ['ISO 9001', 'ISO 45001', 'CE', 'DoP'] },
  horeca: { required: ['HACCP'], suggested: ['IFS', 'BRC', 'ISO 22000', 'organic'] },
  healthcare: { required: ['CE', 'MDR', 'ISO 13485'], suggested: ['FDA', 'ISO 14971', 'ISO 9001'] },
  retail: { required: [], suggested: ['OEKO-TEX', 'GOTS', 'FDA', 'CE', 'BSCI'] },
  logistics: { required: [], suggested: ['AEO'] },
  mro: { required: [], suggested: ['ISO 9001', 'CE', 'UL', 'ATEX'] },
  other: { required: [], suggested: ['ISO 9001', 'CE'] },
};

// Industry subcategory + extra context — every branch must visibly reshape the form,
// not just the three (events / construction / retail) that had unique fields. Each
// branch gets a pill-row with 5-6 specializations that flow into the strategy agent
// prompt as "user is sourcing X for Y" hint.
export const INDUSTRY_SUBCATEGORIES: Record<Industry, { value: string; pl: string; en: string }[]> = {
  manufacturing: [
    { value: 'cnc', pl: 'Obróbka CNC', en: 'CNC machining' },
    { value: 'injection', pl: 'Wtrysk tworzyw', en: 'Injection molding' },
    { value: 'casting', pl: 'Odlewy', en: 'Casting' },
    { value: 'sheet_metal', pl: 'Obróbka blach', en: 'Sheet metal' },
    { value: 'assembly', pl: 'Montaż / EMS', en: 'Assembly / EMS' },
    { value: 'raw_material', pl: 'Surowiec / granulat', en: 'Raw material / pellets' },
  ],
  events: [
    { value: 'catering', pl: 'Catering', en: 'Catering' },
    { value: 'av', pl: 'Nagłośnienie / AV', en: 'AV / lighting' },
    { value: 'staging', pl: 'Scenografia', en: 'Staging / décor' },
    { value: 'staff', pl: 'Obsługa / hostessy', en: 'Staff / hostesses' },
    { value: 'gadgets', pl: 'Gadżety brandowane', en: 'Branded gadgets' },
    { value: 'venue', pl: 'Wynajem przestrzeni', en: 'Venue rental' },
  ],
  construction: [
    { value: 'hvac', pl: 'HVAC', en: 'HVAC' },
    { value: 'electrical', pl: 'Elektryka', en: 'Electrical' },
    { value: 'finishing', pl: 'Wykończenia', en: 'Finishing' },
    { value: 'structural', pl: 'Konstrukcja', en: 'Structural' },
    { value: 'materials', pl: 'Materiały budowlane', en: 'Building materials' },
    { value: 'plumbing', pl: 'Hydraulika', en: 'Plumbing' },
  ],
  horeca: [
    { value: 'food_supply', pl: 'Dostawa F&B', en: 'F&B supply' },
    { value: 'kitchen_equipment', pl: 'Sprzęt kuchenny', en: 'Kitchen equipment' },
    { value: 'beverage', pl: 'Napoje / alkohol', en: 'Beverages / alcohol' },
    { value: 'catering_external', pl: 'Catering zewnętrzny', en: 'External catering' },
    { value: 'maintenance', pl: 'Serwis sprzętu', en: 'Equipment service' },
    { value: 'cleaning', pl: 'Środki czystości', en: 'Cleaning supplies' },
  ],
  healthcare: [
    { value: 'disposables', pl: 'Jednorazówki', en: 'Disposables' },
    { value: 'medical_devices', pl: 'Wyroby medyczne', en: 'Medical devices' },
    { value: 'lab_equipment', pl: 'Sprzęt laboratoryjny', en: 'Lab equipment' },
    { value: 'consumables', pl: 'Materiały eksploatacyjne', en: 'Consumables' },
    { value: 'pharma', pl: 'Farmaceutyki / API', en: 'Pharma / API' },
    { value: 'ppe', pl: 'PPE / odzież ochr.', en: 'PPE' },
  ],
  retail: [
    { value: 'cosmetics', pl: 'Kosmetyki', en: 'Cosmetics' },
    { value: 'apparel', pl: 'Odzież / akcesoria', en: 'Apparel / accessories' },
    { value: 'electronics', pl: 'Elektronika', en: 'Electronics' },
    { value: 'home_goods', pl: 'Home goods', en: 'Home goods' },
    { value: 'food', pl: 'Spożywka', en: 'Food' },
    { value: 'packaging', pl: 'Opakowania', en: 'Packaging' },
  ],
  logistics: [
    { value: '3pl', pl: '3PL / magazyn', en: '3PL / warehouse' },
    { value: 'racking', pl: 'Regały / sprzęt mag.', en: 'Racking / warehouse equip.' },
    { value: 'fleet_parts', pl: 'Części do floty', en: 'Fleet parts' },
    { value: 'last_mile', pl: 'Last-mile', en: 'Last-mile' },
    { value: 'fulfillment', pl: 'E-com fulfillment', en: 'E-com fulfillment' },
    { value: 'cold_chain', pl: 'Cold chain', en: 'Cold chain' },
  ],
  mro: [
    { value: 'bearings', pl: 'Łożyska / uszczelnienia', en: 'Bearings / seals' },
    { value: 'motors', pl: 'Silniki / napędy', en: 'Motors / drives' },
    { value: 'spare_parts', pl: 'Części zamienne OEM', en: 'OEM spare parts' },
    { value: 'maintenance_svc', pl: 'Utrzymanie ruchu', en: 'Maintenance service' },
    { value: 'tools', pl: 'Narzędzia / oprzyrz.', en: 'Tools' },
    { value: 'lubricants', pl: 'Smary / chemia tech.', en: 'Lubricants / tech chemistry' },
  ],
  other: [],
};

// Extra industry-specific pickers. Surfaced only for industries where the
// strategy agent measurably benefits from the signal (events get dates,
// construction gets stage, MRO gets urgency, manufacturing gets tolerance).
export const EVENT_TYPES: { value: string; pl: string; en: string }[] = [
  { value: 'conference', pl: 'Konferencja', en: 'Conference' },
  { value: 'trade_show', pl: 'Targi', en: 'Trade show' },
  { value: 'gala', pl: 'Gala / kolacja', en: 'Gala / dinner' },
  { value: 'incentive', pl: 'Incentive / wyjazd', en: 'Incentive trip' },
  { value: 'product_launch', pl: 'Premiera produktu', en: 'Product launch' },
  { value: 'corporate', pl: 'Event firmowy', en: 'Corporate event' },
];

export const CONSTRUCTION_STAGES: { value: string; pl: string; en: string }[] = [
  { value: 'planning', pl: 'Planowanie / projekt', en: 'Planning / design' },
  { value: 'foundation', pl: 'Fundamenty', en: 'Foundation' },
  { value: 'structure', pl: 'Konstrukcja', en: 'Structure' },
  { value: 'finishing', pl: 'Wykończenia', en: 'Finishing' },
  { value: 'renovation', pl: 'Remont / przebudowa', en: 'Renovation' },
];

export const HORECA_VENUES: { value: string; pl: string; en: string }[] = [
  { value: 'hotel', pl: 'Hotel', en: 'Hotel' },
  { value: 'restaurant', pl: 'Restauracja', en: 'Restaurant' },
  { value: 'chain', pl: 'Sieć / multi-unit', en: 'Chain / multi-unit' },
  { value: 'catering_co', pl: 'Firma cateringowa', en: 'Catering company' },
  { value: 'cafe', pl: 'Kawiarnia / bar', en: 'Café / bar' },
];

export const HEALTHCARE_REG_CLASSES: { value: string; pl: string; en: string }[] = [
  { value: 'class_I', pl: 'CE Klasa I (niskie ryzyko)', en: 'CE Class I (low risk)' },
  { value: 'class_IIa', pl: 'CE Klasa IIa', en: 'CE Class IIa' },
  { value: 'class_IIb', pl: 'CE Klasa IIb', en: 'CE Class IIb' },
  { value: 'class_III', pl: 'CE Klasa III (wysokie)', en: 'CE Class III (high risk)' },
  { value: 'not_regulated', pl: 'Nieregulowany', en: 'Not regulated' },
];

export const MRO_URGENCY: { value: string; pl: string; en: string }[] = [
  { value: 'emergency', pl: 'Emergency (linia stoi)', en: 'Emergency (line down)' },
  { value: 'priority', pl: 'Priority (kilka dni)', en: 'Priority (within days)' },
  { value: 'routine', pl: 'Routine (planowo)', en: 'Routine (planned)' },
];

export const LOGISTICS_SLAS: { value: string; pl: string; en: string }[] = [
  { value: 'sla_24h', pl: 'SLA 24h', en: '24h SLA' },
  { value: 'sla_48h', pl: 'SLA 48h', en: '48h SLA' },
  { value: 'sla_same_day', pl: 'Same-day', en: 'Same-day' },
  { value: 'no_sla', pl: 'Bez SLA', en: 'No SLA' },
];

export const MFG_TOLERANCES: { value: string; pl: string; en: string }[] = [
  { value: 'iso2768_m', pl: 'ISO 2768-mK (standardowe)', en: 'ISO 2768-mK (standard)' },
  { value: 'iso2768_f', pl: 'ISO 2768-fH (precyzyjne)', en: 'ISO 2768-fH (precise)' },
  { value: 'tight', pl: 'Ścisłe (<0.05mm)', en: 'Tight (<0.05mm)' },
  { value: 'loose', pl: 'Luźne (komercyjne)', en: 'Loose (commercial)' },
  { value: 'na', pl: 'Nie dotyczy', en: 'N/A' },
];

export const RETAIL_BRAND_MODELS: { value: string; pl: string; en: string }[] = [
  { value: 'private_label', pl: 'Private label (pod naszą marką)', en: 'Private label (our brand)' },
  { value: 'reseller', pl: 'Reseller (cudza marka)', en: 'Reseller (their brand)' },
  { value: 'oem_design', pl: 'OEM z naszym designem', en: 'OEM (our design)' },
];

// Unit dropdown options — universal across industries. Avoids free-text mistakes
// (kg vs Kg vs kilo) and lets us aggregate volumes downstream.
export const UNIT_OPTIONS: { value: string; pl: string; en: string }[] = [
  { value: 'pcs', pl: 'szt.', en: 'pcs' },
  { value: 'kg', pl: 'kg', en: 'kg' },
  { value: 'tonnes', pl: 't', en: 'tonnes' },
  { value: 'meters', pl: 'm', en: 'meters' },
  { value: 'm2', pl: 'm²', en: 'm²' },
  { value: 'm3', pl: 'm³', en: 'm³' },
  { value: 'liters', pl: 'l', en: 'liters' },
  { value: 'pallets', pl: 'palety', en: 'pallets' },
  { value: 'boxes', pl: 'kartony', en: 'boxes' },
  { value: 'sets', pl: 'kpl.', en: 'sets' },
  { value: 'hours', pl: 'godz.', en: 'hours' },
  { value: 'days', pl: 'dni', en: 'days' },
  { value: 'months', pl: 'mies.', en: 'months' },
  { value: 'people', pl: 'os.', en: 'people' },
  { value: 'services', pl: 'usługi', en: 'services' },
];

// One-click sample briefs per industry — break the blank-canvas freeze.
export const SAMPLE_BRIEFS: Record<Industry, { pl: string; en: string }[]> = {
  manufacturing: [
    { pl: 'Granulat HDPE virgin, 50 ton/mies., Europa, ISO 9001, MOQ 5 ton, lead time max 4 tyg.', en: 'HDPE virgin granulate, 50 tons/month, Europe, ISO 9001, MOQ 5 tons, lead time max 4 weeks.' },
    { pl: 'Obudowy do kontrolera IoT, wtrysk z ABS, 10 000 szt/rok, IATF 16949, partia próbna 200 szt.', en: 'IoT controller enclosures, ABS injection molded, 10k units/yr, IATF 16949, sample batch 200 pcs.' },
  ],
  events: [
    { pl: 'Catering dla 500 osób na konferencji w Berlinie, 18 grudnia, opcje wegańskie i bezglutenowe, budżet do 45 EUR/os.', en: 'Catering for 500 people at a conference in Berlin, December 18, vegan and gluten-free options, budget up to €45/person.' },
    { pl: 'Obsługa AV (nagłośnienie, ekran LED, oświetlenie) na event firmowy w Warszawie, 14 listopada, 300 uczestników.', en: 'AV services (sound, LED screen, lighting) for a corporate event in Warsaw, November 14, 300 attendees.' },
  ],
  construction: [
    { pl: 'Podwykonawca HVAC do osiedla 200 mieszkań w województwie mazowieckim, ISO 9001, OC min. 5M PLN.', en: 'HVAC subcontractor for a 200-unit residential development in Masovian voivodeship, ISO 9001, liability insurance min. 5M PLN.' },
    { pl: 'Stal konstrukcyjna S355 do hali produkcyjnej, 80 ton, Dolnośląskie, DoP, CE, dostawa w 6 tygodni.', en: 'S355 structural steel for a production hall, 80 tons, Lower Silesia, DoP, CE, delivery in 6 weeks.' },
  ],
  horeca: [
    { pl: 'Dostawca oliwy extra virgin z Andaluzji dla sieci 12 hoteli w Polsce, MOQ 200 L/mies, HACCP, bio certificate.', en: 'Extra virgin olive oil supplier from Andalusia for a chain of 12 hotels in Poland, MOQ 200 L/month, HACCP, organic certificate.' },
    { pl: 'Dostawca świeżych ryb dla restauracji fine dining w Gdańsku, codzienna dostawa, IFS Food.', en: 'Fresh fish supplier for a fine-dining restaurant in Gdańsk, daily delivery, IFS Food.' },
  ],
  healthcare: [
    { pl: 'Jednorazowe rękawiczki nitrylowe dla kliniki, 100 000 par/mies., CE, MDR, ISO 13485, nearshore.', en: 'Single-use nitrile gloves for a clinic, 100k pairs/month, CE, MDR, ISO 13485, nearshore.' },
    { pl: 'Sprzęt laboratoryjny (pipety automatyczne, wirówki) dla szpitala w Krakowie, CE, wsparcie techniczne PL.', en: 'Lab equipment (automatic pipettes, centrifuges) for a Kraków hospital, CE, PL technical support.' },
  ],
  retail: [
    { pl: 'Opakowania kosmetyczne private label (butelki 50ml z pompką), 20 000 szt, nearshore UE, MOQ 5000, OEKO-TEX.', en: 'Private-label cosmetic packaging (50ml bottles with pump), 20k pcs, EU nearshore, MOQ 5000, OEKO-TEX.' },
    { pl: 'T-shirty bawełniane pod markę własną, 10 000 szt, Portugalia lub Turcja, GOTS, lead time 6 tyg.', en: 'Private-label cotton t-shirts, 10k pcs, Portugal or Turkey, GOTS, 6-week lead time.' },
  ],
  logistics: [
    { pl: 'System regałów paletowych 10 000 miejsc paletowych, Europa Środkowa, CE, montaż w 8 tygodni.', en: 'Pallet racking system, 10k pallet positions, Central Europe, CE, installation in 8 weeks.' },
    { pl: '3PL dla e-commerce, magazyn koło Warszawy, 500 zamówień/dzień, pick & pack, SLA 24h.', en: '3PL for e-commerce, warehouse near Warsaw, 500 orders/day, pick & pack, 24h SLA.' },
  ],
  mro: [
    { pl: 'Łożyska SKF 6308-2RS1 + aftermarket alternatywy, 2000 szt/rok, 3 zakłady w Polsce.', en: 'SKF 6308-2RS1 bearings + aftermarket alternatives, 2000 pcs/year, 3 plants in Poland.' },
    { pl: 'Serwis maintenance dla linii pakującej FMCG, SLA odpowiedzi <4h, 24/7, Mazowieckie.', en: 'Maintenance service for an FMCG packaging line, SLA response <4h, 24/7, Masovia.' },
  ],
  other: [
    { pl: 'Opisz czego potrzebujesz — AI wypełni formularz za Ciebie.', en: 'Describe what you need — AI will fill the form for you.' },
  ],
};

const REGION_COUNTRY_CODES: Record<string, string[]> = {
  EU: ['DE', 'PL', 'CZ', 'SK', 'HU', 'AT', 'FR', 'IT', 'ES', 'PT', 'NL', 'BE', 'SE', 'RO', 'DK', 'FI', 'IE', 'HR', 'SI', 'BG', 'LT', 'LV', 'EE', 'LU', 'GR', 'CY', 'MT'],
  GLOBAL: ['US', 'DE', 'JP', 'CN', 'KR', 'IN', 'MX', 'BR', 'GB', 'FR', 'IT', 'PL', 'TW', 'VN', 'TH', 'MY', 'TR', 'CZ', 'NL', 'SE', 'CH', 'AT', 'ID', 'ES', 'PT', 'CA', 'AU', 'HU', 'RO', 'DK', 'FI'],
  GLOBAL_NO_CN: ['US', 'DE', 'JP', 'KR', 'IN', 'MX', 'BR', 'GB', 'FR', 'IT', 'PL', 'TW', 'VN', 'TH', 'MY', 'TR', 'CZ', 'NL', 'SE', 'CH', 'AT', 'ID', 'ES', 'PT', 'CA', 'AU', 'HU', 'RO', 'DK', 'FI'],
};

const SINGLE_COUNTRY_REGIONS = new Set(['PL', 'US', 'GB', 'CA', 'AU', 'CN']);

const REGION_OPTIONS_PL: { value: Region; label: string; icon: string; desc: string }[] = [
  { value: 'PL', label: t.campaigns.wizard.search.regionPL, icon: '\u{1F1F5}\u{1F1F1}', desc: t.campaigns.wizard.search.regionDescPL },
  { value: 'EU', label: t.campaigns.wizard.search.regionEU, icon: '\u{1F1EA}\u{1F1FA}', desc: t.campaigns.wizard.search.regionDescEU },
  { value: 'GLOBAL', label: t.campaigns.wizard.search.regionGLOBAL, icon: '\u{1F30D}', desc: t.campaigns.wizard.search.regionDescGLOBAL },
  { value: 'GLOBAL_NO_CN', label: t.campaigns.wizard.search.regionGLOBAL_NO_CN, icon: '\u{1F30E}', desc: t.campaigns.wizard.search.regionDescGLOBAL_NO_CN },
  { value: 'CUSTOM', label: t.campaigns.wizard.search.regionCustom, icon: '\u{1F4CD}', desc: t.campaigns.wizard.search.regionDescCUSTOM },
];

const REGION_OPTIONS_EN: { value: Region; label: string; icon: string; desc: string }[] = [
  { value: 'US', label: t.campaigns.wizard.search.regionUS, icon: '\u{1F1FA}\u{1F1F8}', desc: t.campaigns.wizard.search.regionDescUS },
  { value: 'GB', label: t.campaigns.wizard.search.regionGB, icon: '\u{1F1EC}\u{1F1E7}', desc: t.campaigns.wizard.search.regionDescGB },
  { value: 'CA', label: t.campaigns.wizard.search.regionCA, icon: '\u{1F1E8}\u{1F1E6}', desc: t.campaigns.wizard.search.regionDescCA },
  { value: 'AU', label: t.campaigns.wizard.search.regionAU, icon: '\u{1F1E6}\u{1F1FA}', desc: t.campaigns.wizard.search.regionDescAU },
  { value: 'CN', label: t.campaigns.wizard.search.regionCN, icon: '\u{1F1E8}\u{1F1F3}', desc: t.campaigns.wizard.search.regionDescCN },
  { value: 'EU', label: t.campaigns.wizard.search.regionEU, icon: '\u{1F1EA}\u{1F1FA}', desc: t.campaigns.wizard.search.regionDescEU },
  { value: 'GLOBAL', label: t.campaigns.wizard.search.regionGLOBAL, icon: '\u{1F30D}', desc: t.campaigns.wizard.search.regionDescGLOBAL },
  { value: 'GLOBAL_NO_CN', label: t.campaigns.wizard.search.regionGLOBAL_NO_CN, icon: '\u{1F30E}', desc: t.campaigns.wizard.search.regionDescGLOBAL_NO_CN },
  { value: 'CUSTOM', label: t.campaigns.wizard.search.regionCustom, icon: '\u{1F4CD}', desc: t.campaigns.wizard.search.regionDescCUSTOM },
];

const REGION_OPTIONS = isEN ? REGION_OPTIONS_EN : REGION_OPTIONS_PL;

const INCOTERMS_OPTIONS: { value: string; label: string; desc: string }[] = [
  { value: 'EXW', label: 'EXW', desc: t.campaigns.wizard.incotermsOptions.EXW },
  { value: 'FCA', label: 'FCA', desc: t.campaigns.wizard.incotermsOptions.FCA },
  { value: 'DAP', label: 'DAP', desc: t.campaigns.wizard.incotermsOptions.DAP },
  { value: 'DDP', label: 'DDP', desc: t.campaigns.wizard.incotermsOptions.DDP },
  { value: 'FOB', label: 'FOB', desc: t.campaigns.wizard.incotermsOptions.FOB },
  { value: 'CIF', label: 'CIF', desc: t.campaigns.wizard.incotermsOptions.CIF },
];

// ─── Single Zod schema (replaces 4 step schemas) ───────────────────────────

const optionalNumber = z.preprocess(
  (val) => (val === '' || val === undefined || val === null || Number.isNaN(val) ? undefined : Number(val)),
  z.number().optional()
);

// Single source of truth. Cross-field rule: product/mixed mode requires productName,
// service mode requires brief OR productName (canonical from AI).
const wizardSchema = z.object({
  industry: z.enum(INDUSTRY_OPTIONS as [Industry, ...Industry[]]),
  sourcingMode: z.enum(['product', 'service', 'mixed'] as [SourcingMode, ...SourcingMode[]]),
  productName: z.string().max(200).optional(),
  brief: z.string().max(4000).optional(),
  material: z.string().max(100).optional(),
  quantity: optionalNumber,
  unit: z.string().max(20).optional(),
  eau: optionalNumber,
  partNumber: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
  city: z.string().max(100).optional(),
  eventDate: z.string().optional(),
  headcount: optionalNumber,
  moq: optionalNumber,
  leadTimeWeeks: z.preprocess(
    (val) => (val === '' || val === undefined || val === null || Number.isNaN(val) ? undefined : Number(val)),
    z.number().min(1).max(52).optional()
  ),
  sourcingGeography: z.string().optional(),
  industrySubcategory: z.string().optional(),
  eventType: z.string().optional(),
  constructionStage: z.string().optional(),
  horecaVenueType: z.string().optional(),
  healthcareRegClass: z.string().optional(),
  mroUrgency: z.string().optional(),
  logisticsSla: z.string().optional(),
  mfgTolerance: z.string().optional(),
  retailBrandModel: z.string().optional(),
  targetRegion: z.enum(['PL', 'US', 'GB', 'CA', 'AU', 'CN', 'EU', 'GLOBAL', 'GLOBAL_NO_CN', 'CUSTOM']).optional(),
  desiredDeliveryDate: z.string().optional(),
  deliveryLocationId: z.string().optional(),
  sequenceTemplateId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.sourcingMode === 'service') {
    if (!data.brief || data.brief.length < 10) {
      ctx.addIssue({
        code: 'custom',
        path: ['brief'],
        message: isEN ? 'Describe the service you need (min 10 chars)' : 'Opisz potrzebną usługę (min. 10 znaków)',
      });
    }
  } else {
    if (!data.productName || data.productName.length < 2) {
      ctx.addIssue({
        code: 'custom',
        path: ['productName'],
        message: isEN ? 'Product name is required (min 2 chars)' : 'Nazwa produktu jest wymagana (min. 2 znaki)',
      });
    }
  }
  if (!data.targetRegion) {
    ctx.addIssue({
      code: 'custom',
      path: ['targetRegion'],
      message: t.campaigns.wizard.validation.selectRegion,
    });
  }
});

type WizardFormData = z.infer<typeof wizardSchema>;

// ─── Draft persistence ─────────────────────────────────────────────────────

const WIZARD_STORAGE_KEY = 'procurea_wizard_draft_v3';

interface WizardDraft {
  formData: Partial<CreateCampaignDto>;
  certificates: string[];
  selectedCountries: string[];
  excludedCountries: string[];
  selectedVoivodeships: string[];
  selectedIncoterms: string[];
}

function loadWizardDraft(): WizardDraft | null {
  try {
    const raw = sessionStorage.getItem(WIZARD_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WizardDraft;
    if (!parsed?.formData) return null;
    return parsed;
  } catch { return null; }
}

function saveWizardDraft(data: WizardDraft) {
  try { sessionStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

function clearWizardDraft() {
  try { sessionStorage.removeItem(WIZARD_STORAGE_KEY); } catch { /* ignore */ }
}

// ─── Component props ───────────────────────────────────────────────────────

interface RfqWizardProps {
  onComplete?: (campaignId: string) => void;
  prefillIndustry?: Industry;
  prefillMode?: SourcingMode;
}

// ─── Main wizard ────────────────────────────────────────────────────────────

export function RfqWizard({ onComplete, prefillIndustry, prefillMode }: RfqWizardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isFullPlan = user?.plan === 'full';

  // Form data — single source of truth
  const [formData, setFormData] = useState<Partial<CreateCampaignDto>>({
    supplierTypes: ['PRODUCENT'],
    sourcingMode: prefillMode || 'product',
    industry: prefillIndustry || 'manufacturing',
    targetRegion: 'EU',
    unit: t.campaigns.wizard.specs.unitDefault,
  });

  // Multi-select fields kept in dedicated state for reactive UX
  const [certificates, setCertificates] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [excludedCountries, setExcludedCountries] = useState<string[]>([]);
  const [selectedVoivodeships, setSelectedVoivodeships] = useState<string[]>([]);
  const [selectedIncoterms, setSelectedIncoterms] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<{ id: string; filename: string; url: string; size: number }[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<DocumentRecord[]>([]);

  // UX state
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [showExcludePanel, setShowExcludePanel] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [excludeSearch, setExcludeSearch] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  const [parsedBrief, setParsedBrief] = useState<ParsedBrief | null>(null);
  const [sequences, setSequences] = useState<SequenceTemplate[]>([]);
  const [locations, setLocations] = useState<OrganizationLocation[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const createMutation = useCreateCampaign();
  const submittedRef = useRef(false);

  // RHF for inline validation messages — values driven from formData
   
  const form = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema as any),
    mode: 'onSubmit',
    defaultValues: formData as WizardFormData,
  });

  // Sync formData → react-hook-form so submit validation sees latest values.
  useEffect(() => { form.reset(formData as WizardFormData); }, [formData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Resume draft on mount
  useEffect(() => {
    const draft = loadWizardDraft();
    if (draft?.formData?.industry) setShowResumeDialog(true);
    analytics.campaignWizardStart();
    if (prefillIndustry || prefillMode) analytics.wizardPrefillApplied(prefillIndustry, prefillMode);
    const cleanupHesitation = startHesitationTracker('wizard_v3', 60000);
    return () => {
      cleanupHesitation();
      if (!submittedRef.current) analytics.campaignWizardAbandoned(0);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save (only after user has started filling)
  useEffect(() => {
    if (submittedRef.current) return;
    if (!formData.industry) return;
    saveWizardDraft({ formData, certificates, selectedCountries, excludedCountries, selectedVoivodeships, selectedIncoterms });
  }, [formData, certificates, selectedCountries, excludedCountries, selectedVoivodeships, selectedIncoterms]);

  // No auto-add of "industry-required" certs — user wants full control over
  // which certs filter suppliers. Suggestions still appear via INDUSTRY_CERTIFICATES.

  // Load sequences + locations
  useEffect(() => {
    sequencesService.getAll().then(setSequences).catch(() => { });
    if (user?.organizationId) {
      organizationService.getLocations(user.organizationId).then((locs) => {
        setLocations(locs);
        if (!formData.deliveryLocationId) {
          const def = locs.find(l => l.isDefault);
          if (def) setFormData(prev => ({ ...prev, deliveryLocationId: def.id }));
        }
      }).catch(() => { });
    }
  }, [user?.organizationId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (sequences.length > 0 && !formData.sequenceTemplateId) {
      setFormData(prev => ({ ...prev, sequenceTemplateId: sequences[0].id }));
    }
  }, [sequences]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResumeDraft = () => {
    const draft = loadWizardDraft();
    if (draft) {
      setFormData(draft.formData);
      setCertificates(draft.certificates || []);
      setSelectedCountries(draft.selectedCountries || []);
      setExcludedCountries(draft.excludedCountries || []);
      setSelectedVoivodeships(draft.selectedVoivodeships || []);
      setSelectedIncoterms(draft.selectedIncoterms || []);
    }
    setShowResumeDialog(false);
  };

  const handleStartFresh = () => {
    clearWizardDraft();
    setShowResumeDialog(false);
  };

  // ─── AI-parser — pulls structured fields out of brief textarea ──────────

  const handleAiFill = async () => {
    const brief = (formData.brief || formData.description || '').trim();
    const industry = formData.industry as Industry | undefined;
    const sourcingMode = formData.sourcingMode as SourcingMode | undefined;
    if (brief.length < 10) {
      toast.error(isEN ? 'Describe your need first (at least 10 characters).' : 'Opisz najpierw zapotrzebowanie (min. 10 znaków).');
      return;
    }
    setAiParsing(true);
    analytics.briefAiFillClicked(industry, sourcingMode);
    try {
      const parsed = await campaignsService.parseBrief({ brief, industry, sourcingMode });
      setParsedBrief(parsed);
      analytics.briefAiFillSucceeded(parsed.confidence, parsed.industry, parsed.sourcingMode);
      if (parsed.confidence < 0.4) analytics.briefAiFillLowConfidence(parsed.confidence, parsed.industry);

      setFormData(prev => ({
        ...prev,
        industry: parsed.industry,
        sourcingMode: parsed.sourcingMode,
        brief,
        parsedBrief: parsed,
        productName: parsed.productName || prev.productName,
        material: parsed.material || prev.material,
        quantity: parsed.quantity ?? prev.quantity,
        unit: parsed.unit || prev.unit,
        eau: parsed.eau ?? prev.eau,
        partNumber: parsed.partNumber || prev.partNumber,
        description: parsed.description || prev.description,
        targetRegion: parsed.targetRegion || prev.targetRegion,
        targetCountries: parsed.targetCountries || prev.targetCountries,
        city: parsed.city || prev.city,
        eventDate: parsed.eventDate || prev.eventDate,
        headcount: parsed.headcount ?? prev.headcount,
        desiredDeliveryDate: parsed.desiredDeliveryDate || prev.desiredDeliveryDate,
        targetPrice: parsed.targetPrice ?? prev.targetPrice,
        currency: parsed.currency || prev.currency,
      }));
      if (parsed.requiredCertificates?.length) setCertificates(prev => Array.from(new Set([...prev, ...(parsed.requiredCertificates || [])])));
      if (parsed.targetCountries?.length) setSelectedCountries(parsed.targetCountries);
      if (parsed.incoterms?.length) setSelectedIncoterms(parsed.incoterms);
      toast.success(t.campaigns.wizard.brief?.aiFilled || 'Form auto-filled');
    } catch (err) {
      console.error('Brief parse failed:', err);
      const reason = (err as { statusCode?: number })?.statusCode === 429 ? 'rate_limited' : 'server_error';
      analytics.briefAiFillFailed(reason);
      toast.error(t.campaigns.wizard.brief?.aiError || 'Failed to parse brief');
    } finally {
      setAiParsing(false);
    }
  };

  // ─── Submit ─────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const valid = await form.trigger();
    if (!valid) {
      const errs = form.formState.errors;
      const firstError = Object.values(errs)[0]?.message as string | undefined;
      toast.error(firstError || (isEN ? 'Some fields need attention' : 'Niektóre pola wymagają uwagi'));
      // Scroll to first error
      const errKey = Object.keys(errs)[0];
      if (errKey) {
        const el = document.querySelector(`[name="${errKey}"]`) || document.getElementById(`field-${errKey}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSubmitting(true);
    const productNameFinal = formData.productName?.trim()
      || (formData.brief?.trim().slice(0, 100))
      || (parsedBrief?.productName)
      || (isEN ? 'Sourcing campaign' : 'Kampania sourcingowa');

    const finalData: Partial<CreateCampaignDto> & { name: string } = {
      ...formData,
      productName: productNameFinal,
      name: `${t.campaigns.wizard.email.campaignPrefix}: ${productNameFinal}`,
      requiredCertificates: certificates,
      incoterms: selectedIncoterms.join(','),
      targetCountries: formData.targetRegion === 'CUSTOM' ? selectedCountries : undefined,
      excludedCountries: (excludedCountries.length > 0 && formData.targetRegion !== 'CUSTOM' && !SINGLE_COUNTRY_REGIONS.has(formData.targetRegion as string))
        ? excludedCountries
        : undefined,
      voivodeships: selectedVoivodeships.length > 0 ? selectedVoivodeships : undefined,
      ...((attachments.length > 0 || selectedDocs.length > 0) ? {
        attachments: JSON.stringify([
          ...attachments,
          ...selectedDocs.map((d) => ({ id: d.id, filename: d.originalName, url: d.url, size: d.sizeBytes })),
        ]),
      } : {}),
    };

    try {
      const result = await createMutation.mutateAsync(finalData as CreateCampaignDto);
      submittedRef.current = true;
      clearWizardDraft();
      analytics.campaignCreated(formData.targetRegion, formData.industry as string | undefined, formData.sourcingMode as string | undefined);
      if (onComplete) onComplete(result.id);
      else navigate(`/campaigns/${result.id}`);
    } catch (error: unknown) {
      const err = error as { message?: string; statusCode?: number };
      const msg = err?.message || t.campaigns.wizard.validation.createError;
      const isCreditsError = err?.statusCode === 400 && (msg.toLowerCase().includes('kredyt') || msg.toLowerCase().includes('wyszukiw'));
      if (isCreditsError) {
        toast.error(msg, {
          duration: 8000,
          action: { label: t.settings.billing.topUp.action, onClick: () => useUIStore.getState().openBillingModal() },
        });
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Derived UI flags ───────────────────────────────────────────────────

  const industry = (formData.industry as Industry) || 'manufacturing';
  const mode = (formData.sourcingMode as SourcingMode) || 'product';
  const isService = mode === 'service';
  const isProduct = mode === 'product';
  const isMixed = mode === 'mixed';
  const isProductish = isProduct || isMixed;

  // City visibility for events/construction/horeca service-mode flows. (Other branch
  // flags now live inside Section 2 — see industry === 'X' guards there.)
  const showCity = (industry === 'events' || industry === 'construction' || industry === 'horeca') && (isService || isMixed);
  const showMoqLeadTime = isProductish && (industry === 'manufacturing' || industry === 'retail' || industry === 'healthcare' || industry === 'mro' || industry === 'logistics' || industry === 'other');

  const currentRegion = (formData.targetRegion as string) || 'EU';
  const regionCodes = REGION_COUNTRY_CODES[currentRegion] || [];
  const filteredCountries = countrySearch
    ? AVAILABLE_COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
    : AVAILABLE_COUNTRIES;
  const excludeableCountries = AVAILABLE_COUNTRIES.filter(c => regionCodes.includes(c.code));
  const filteredExcludeCountries = excludeSearch
    ? excludeableCountries.filter(c => c.name.toLowerCase().includes(excludeSearch.toLowerCase()))
    : excludeableCountries;

  const certSet = INDUSTRY_CERTIFICATES[industry];
  const certSuggestions = Array.from(new Set([...certSet.required, ...certSet.suggested, 'ISO 9001', 'CE']));

  const samples = SAMPLE_BRIEFS[industry] || SAMPLE_BRIEFS.other;

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      {/* Resume draft dialog */}
      <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEN ? 'Resume previous form?' : 'Wznowić poprzedni formularz?'}</DialogTitle>
            <DialogDescription>
              {isEN ? 'You have an unfinished campaign. Resume or start fresh?' : 'Masz niedokończoną kampanię. Wznowić czy zacząć od nowa?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleStartFresh}>{isEN ? 'Start fresh' : 'Zacznij od nowa'}</Button>
            <Button onClick={handleResumeDraft}>{isEN ? 'Resume' : 'Wznów'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-4xl mx-auto pb-32">
        {/* ───── Sticky industry + mode header ─────────────────────────── */}
        <div className="sticky top-14 z-20 -mx-4 lg:-mx-8 px-4 lg:px-8 py-3 bg-background/95 backdrop-blur border-b mb-6">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">{t.campaigns.wizard.brief?.industryLabel || 'Branża'}</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
                {INDUSTRY_OPTIONS.map((ind) => {
                  const Icon = INDUSTRY_ICON[ind];
                  const selected = industry === ind;
                  const labelKey = ind as keyof typeof t.campaigns.wizard.brief.industries;
                  return (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, industry: ind }))}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 text-xs whitespace-nowrap transition-all shrink-0',
                        selected
                          ? 'border-primary bg-primary/5 text-primary font-medium ring-2 ring-primary/20'
                          : 'border-input hover:border-primary/40 hover:bg-muted/30'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{t.campaigns.wizard.brief.industries[labelKey] as string}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">{t.campaigns.wizard.brief?.modeLabel || 'Czego szukasz?'}</p>
              <div className="grid grid-cols-3 gap-2">
                {(['product', 'service', 'mixed'] as SourcingMode[]).map((m) => {
                  const selected = mode === m;
                  const labels: Record<SourcingMode, { label: string; desc: string; icon: typeof Package }> = {
                    product: { label: t.campaigns.wizard.brief.modeProduct, desc: t.campaigns.wizard.brief.modeProductDesc, icon: Package },
                    service: { label: t.campaigns.wizard.brief.modeService, desc: t.campaigns.wizard.brief.modeServiceDesc, icon: Briefcase },
                    mixed: { label: t.campaigns.wizard.brief.modeMixed, desc: t.campaigns.wizard.brief.modeMixedDesc, icon: Sparkles },
                  };
                  const ModeIcon = labels[m].icon;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, sourcingMode: m }))}
                      className={cn(
                        'flex items-start gap-2 p-2.5 rounded-lg border-2 text-left transition-all',
                        selected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-input hover:border-primary/40 hover:bg-muted/30'
                      )}
                    >
                      <ModeIcon className="h-4 w-4 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium leading-tight">{labels[m].label}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{labels[m].desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ───── Section 1 — What you need (mode-adaptive) ────────────── */}
        <FormSection
          number={1}
          title={isService
            ? (isEN ? 'Describe what you need' : 'Opisz czego potrzebujesz')
            : (isEN ? 'What are you sourcing?' : 'Czego szukasz?')}
          subtitle={isService
            ? (isEN ? 'A few sentences — AI will fill the rest.' : 'Kilka zdań — AI wypełni resztę.')
            : (isEN ? 'Product details + optional brief.' : 'Specyfikacja produktu + opcjonalny opis.')}
        >
          {/* Product/mixed: classic name + spec */}
          {(isProduct || isMixed) && (
            <>
              <Field
                id="productName"
                label={t.campaigns.wizard.basicInfo.productName}
                required
                error={form.formState.errors.productName?.message as string}
              >
                <input
                  type="text"
                  name="productName"
                  value={formData.productName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                  maxLength={200}
                  placeholder={t.campaigns.wizard.basicInfo.productNamePlaceholder}
                  className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field id="material" label={t.campaigns.wizard.specs.material} optional>
                  <input
                    type="text"
                    value={formData.material || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                    maxLength={100}
                    placeholder={t.campaigns.wizard.specs.materialPlaceholder}
                    className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </Field>
                <Field id="partNumber" label={t.campaigns.wizard.specs.partNumber} optional>
                  <input
                    type="text"
                    value={formData.partNumber || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, partNumber: e.target.value }))}
                    maxLength={100}
                    placeholder={t.campaigns.wizard.specs.partNumberPlaceholder}
                    className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Field id="quantity" label={t.campaigns.wizard.specs.quantity} required>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.quantity ?? ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value === '' ? undefined : Number(e.target.value) }))}
                    placeholder={t.campaigns.wizard.specs.quantityPlaceholder}
                    className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </Field>
                <Field id="unit" label={t.campaigns.wizard.specs.unit} optional>
                  <select
                    value={formData.unit || 'pcs'}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {UNIT_OPTIONS.map(u => (
                      <option key={u.value} value={u.value}>{isEN ? u.en : u.pl}</option>
                    ))}
                  </select>
                </Field>
                <Field id="eau" label={t.campaigns.wizard.specs.eau} optional>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.eau ?? ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, eau: e.target.value === '' ? undefined : Number(e.target.value) }))}
                    placeholder={t.campaigns.wizard.specs.eauPlaceholder}
                    className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </Field>
              </div>
              <Field id="description" label={t.campaigns.wizard.basicInfo.description} optional>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  maxLength={1000}
                  placeholder={t.campaigns.wizard.basicInfo.descriptionPlaceholder}
                  rows={3}
                  className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </Field>
            </>
          )}

          {/* Service/mixed: brief textarea */}
          {(isService || isMixed) && (
            <Field
              id="brief"
              label={isService
                ? (isEN ? 'Service description' : 'Opis usługi')
                : (isEN ? 'Additional context (optional)' : 'Dodatkowy kontekst (opcjonalnie)')}
              required={isService}
              error={form.formState.errors.brief?.message as string}
            >
              <textarea
                name="brief"
                value={formData.brief || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, brief: e.target.value }))}
                maxLength={4000}
                placeholder={t.campaigns.wizard.brief.placeholder}
                rows={isService ? 5 : 3}
                className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              />
            </Field>
          )}

          {/* AI parser button + sample chips */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
              <span className="text-xs text-muted-foreground self-center mr-1">
                {isEN ? 'Examples:' : 'Przykłady:'}
              </span>
              {samples.slice(0, 2).map((s, i) => {
                const text = isEN ? s.en : s.pl;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, brief: text }))}
                    className="text-left text-xs px-2.5 py-1 rounded-md border border-dashed border-input hover:border-primary hover:bg-primary/5 transition-all max-w-[280px] truncate"
                    title={text}
                  >
                    {text}
                  </button>
                );
              })}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAiFill}
              disabled={aiParsing}
              className="shrink-0"
            >
              {aiParsing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t.campaigns.wizard.brief.aiFilling}</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" />{t.campaigns.wizard.brief.aiFillButton}</>
              )}
            </Button>
          </div>

          {parsedBrief && parsedBrief.confidence < 0.4 && parsedBrief.notes && (
            <Alert>
              <AlertDescription>{parsedBrief.notes}</AlertDescription>
            </Alert>
          )}
        </FormSection>

        {/* ───── Section 2 — Industry-specific (always visible) ───────────
            Every industry must reshape the form: subcategory pill row + 1-2
            extra pickers per branch (event type, construction stage, MRO
            urgency, etc.). User explicitly asked for this — picking a branch
            had to do more than swap a couple of niche fields. */}
        {industry !== 'other' && INDUSTRY_SUBCATEGORIES[industry]?.length > 0 && (
          <FormSection
            number={2}
            title={isEN ? `${(t.campaigns.wizard.brief.industries as Record<string, string>)[industry] || industry} — details` : `${(t.campaigns.wizard.brief.industries as Record<string, string>)[industry] || industry} — szczegóły`}
            subtitle={isEN ? 'Fields tuned for your branch — they shape what AI looks for.' : 'Pola dopasowane do branży — sterują czego szuka AI.'}
          >
            {/* Subcategory — every branch gets one */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {isEN ? 'Specialization' : 'Specjalizacja'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {INDUSTRY_SUBCATEGORIES[industry].map(sub => {
                  const selected = formData.industrySubcategory === sub.value;
                  return (
                    <button
                      key={sub.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, industrySubcategory: prev.industrySubcategory === sub.value ? undefined : sub.value }))}
                      className={cn(
                        'px-3 py-2 rounded-lg border-2 text-xs text-left transition-all',
                        selected ? 'border-primary bg-primary/5 text-primary font-medium ring-2 ring-primary/20' : 'border-input hover:border-primary/40'
                      )}
                    >
                      {isEN ? sub.en : sub.pl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Manufacturing — tolerance dropdown */}
            {industry === 'manufacturing' && (
              <BranchPills
                label={isEN ? 'Tolerance / quality grade' : 'Tolerancje / klasa jakości'}
                options={MFG_TOLERANCES}
                value={formData.mfgTolerance}
                onChange={(v) => setFormData(prev => ({ ...prev, mfgTolerance: v }))}
                isEN={isEN}
              />
            )}

            {/* Events — type + city + date + headcount */}
            {industry === 'events' && (
              <>
                <BranchPills
                  label={isEN ? 'Event type' : 'Typ wydarzenia'}
                  options={EVENT_TYPES}
                  value={formData.eventType}
                  onChange={(v) => setFormData(prev => ({ ...prev, eventType: v }))}
                  isEN={isEN}
                />
                {(showCity || isService || isMixed) && (
                  <Field id="city" label={t.campaigns.wizard.serviceFields.city} required>
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      maxLength={100}
                      placeholder={t.campaigns.wizard.serviceFields.cityPlaceholder}
                      className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{t.campaigns.wizard.serviceFields.cityHint}</p>
                  </Field>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <Field id="eventDate" label={t.campaigns.wizard.serviceFields.eventDate}>
                    <input
                      type="date"
                      value={formData.eventDate || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                      className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </Field>
                  <Field id="headcount" label={t.campaigns.wizard.serviceFields.headcount}>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.headcount ?? ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, headcount: e.target.value === '' ? undefined : Number(e.target.value) }))}
                      placeholder={t.campaigns.wizard.serviceFields.headcountPlaceholder}
                      className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </Field>
                </div>
              </>
            )}

            {/* Construction — voivodeships + stage + city */}
            {industry === 'construction' && (
              <>
                <BranchPills
                  label={isEN ? 'Project stage' : 'Etap inwestycji'}
                  options={CONSTRUCTION_STAGES}
                  value={formData.constructionStage}
                  onChange={(v) => setFormData(prev => ({ ...prev, constructionStage: v }))}
                  isEN={isEN}
                />
                {(showCity || isService || isMixed) && (
                  <Field id="city" label={isEN ? 'Site city' : 'Miasto inwestycji'} optional>
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      maxLength={100}
                      placeholder={t.campaigns.wizard.serviceFields.cityPlaceholder}
                      className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </Field>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {isEN ? 'PL voivodeships (optional)' : 'Województwa PL (opcjonalnie)'}
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    {isEN ? 'Narrow to specific regions. Hard filter — drops suppliers from other voivodeships.' : 'Zawęź do regionów. Filtr twardy — odrzuca dostawców z innych województw.'}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {PL_VOIVODESHIPS.map(v => {
                      const selected = selectedVoivodeships.includes(v.code);
                      return (
                        <button
                          key={v.code}
                          type="button"
                          onClick={() => setSelectedVoivodeships(prev => selected ? prev.filter(x => x !== v.code) : [...prev, v.code])}
                          className={cn(
                            'px-2.5 py-1.5 rounded-md border text-xs text-left transition-all',
                            selected ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-input hover:border-primary/40'
                          )}
                        >
                          {isEN ? v.labelEn : v.labelPl}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* HoReCa — venue type + city for catering */}
            {industry === 'horeca' && (
              <>
                <BranchPills
                  label={isEN ? 'Venue type' : 'Typ obiektu'}
                  options={HORECA_VENUES}
                  value={formData.horecaVenueType}
                  onChange={(v) => setFormData(prev => ({ ...prev, horecaVenueType: v }))}
                  isEN={isEN}
                />
                {(isService || isMixed) && (
                  <Field id="city" label={t.campaigns.wizard.serviceFields.city} optional>
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      maxLength={100}
                      placeholder={t.campaigns.wizard.serviceFields.cityPlaceholder}
                      className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </Field>
                )}
              </>
            )}

            {/* Healthcare — regulatory class */}
            {industry === 'healthcare' && (
              <BranchPills
                label={isEN ? 'Regulatory class' : 'Klasa regulacyjna'}
                options={HEALTHCARE_REG_CLASSES}
                value={formData.healthcareRegClass}
                onChange={(v) => setFormData(prev => ({ ...prev, healthcareRegClass: v }))}
                isEN={isEN}
              />
            )}

            {/* Retail — brand model + nearshore/offshore */}
            {industry === 'retail' && (
              <>
                <BranchPills
                  label={isEN ? 'Brand model' : 'Model brandowania'}
                  options={RETAIL_BRAND_MODELS}
                  value={formData.retailBrandModel}
                  onChange={(v) => setFormData(prev => ({ ...prev, retailBrandModel: v }))}
                  isEN={isEN}
                />
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {isEN ? 'Sourcing geography' : 'Preferencja geografii'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['nearshore', 'offshore', 'mixed'] as const).map(opt => {
                      const selected = formData.sourcingGeography === opt;
                      const labels = {
                        nearshore: { l: isEN ? 'Nearshore (EU, TR)' : 'Nearshore (UE, TR)', d: isEN ? 'Low MOQ, fast lead' : 'Niski MOQ, szybki lead' },
                        offshore: { l: isEN ? 'Offshore (Asia)' : 'Offshore (Azja)', d: isEN ? 'Lowest unit price' : 'Najniższa cena' },
                        mixed: { l: isEN ? 'Mixed' : 'Mieszane', d: isEN ? 'Compare landed cost' : 'Porównaj landed cost' },
                      };
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, sourcingGeography: opt }))}
                          className={cn(
                            'flex flex-col items-start gap-0.5 p-2.5 rounded-lg border-2 transition-all text-left',
                            selected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-input hover:border-primary/40 hover:bg-muted/30'
                          )}
                        >
                          <span className="text-sm font-medium">{labels[opt].l}</span>
                          <span className="text-xs text-muted-foreground">{labels[opt].d}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Logistics — SLA */}
            {industry === 'logistics' && (
              <BranchPills
                label={isEN ? 'SLA expectation' : 'Wymagany SLA'}
                options={LOGISTICS_SLAS}
                value={formData.logisticsSla}
                onChange={(v) => setFormData(prev => ({ ...prev, logisticsSla: v }))}
                isEN={isEN}
              />
            )}

            {/* MRO — urgency */}
            {industry === 'mro' && (
              <BranchPills
                label={isEN ? 'Urgency' : 'Pilność'}
                options={MRO_URGENCY}
                value={formData.mroUrgency}
                onChange={(v) => setFormData(prev => ({ ...prev, mroUrgency: v }))}
                isEN={isEN}
              />
            )}
          </FormSection>
        )}

        {/* ───── Section 3 — Geography ────────────────────────────────── */}
        <FormSection
          number={industry !== 'other' && INDUSTRY_SUBCATEGORIES[industry]?.length > 0 ? 3 : 2}
          title={t.campaigns.wizard.search.region}
          subtitle={isEN ? 'Where to look for suppliers.' : 'Gdzie szukamy dostawców.'}
        >
          <div>
            <div className="grid grid-cols-2 gap-3">
              {REGION_OPTIONS.map((opt) => {
                const isSelected = (formData.targetRegion || 'EU') === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, targetRegion: opt.value }))}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left',
                      isSelected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-input hover:border-primary/40 hover:bg-muted/30'
                    )}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {form.formState.errors.targetRegion && (
              <p className="text-sm text-destructive mt-2">{form.formState.errors.targetRegion.message as string}</p>
            )}
          </div>

          {/* Custom countries picker */}
          {currentRegion === 'CUSTOM' && (
            <div className="border rounded-lg p-3 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder={isEN ? 'Search countries...' : 'Szukaj krajów...'}
                  className="w-full pl-9 pr-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                {filteredCountries.map(c => {
                  const checked = selectedCountries.includes(c.code);
                  return (
                    <label key={c.code} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/30 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setSelectedCountries(prev => checked ? prev.filter(x => x !== c.code) : [...prev, c.code])}
                      />
                      <span>{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </label>
                  );
                })}
              </div>
              {selectedCountries.length === 0 && (
                <p className="text-xs text-destructive">{t.campaigns.wizard.validation.selectCountry}</p>
              )}
            </div>
          )}

          {/* Exclude countries */}
          {regionCodes.length > 0 && currentRegion !== 'CUSTOM' && !SINGLE_COUNTRY_REGIONS.has(currentRegion) && (
            <div>
              <button
                type="button"
                onClick={() => { setShowExcludePanel(!showExcludePanel); if (!showExcludePanel) setExcludeSearch(''); }}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Globe2 className="h-4 w-4" />
                <span>{t.campaigns.wizard.search.excludeCountries}</span>
                {excludedCountries.length > 0 && <Badge variant="secondary" className="text-xs">{excludedCountries.length}</Badge>}
                <span className="text-xs">{showExcludePanel ? '▲' : '▼'}</span>
              </button>

              {excludedCountries.length > 0 && !showExcludePanel && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {excludedCountries.map(code => {
                    const c = AVAILABLE_COUNTRIES.find(x => x.code === code);
                    return (
                      <Badge key={code} variant="secondary" className="text-xs gap-1">
                        {c?.flag} {c?.name}
                        <button type="button" onClick={() => setExcludedCountries(prev => prev.filter(x => x !== code))}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}

              {showExcludePanel && (
                <div className="border rounded-lg p-3 mt-2 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={excludeSearch}
                      onChange={(e) => setExcludeSearch(e.target.value)}
                      placeholder={isEN ? 'Search countries to exclude...' : 'Szukaj krajów do wykluczenia...'}
                      className="w-full pl-9 pr-3 py-2 border rounded-md bg-background text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                    {filteredExcludeCountries.map(c => {
                      const checked = excludedCountries.includes(c.code);
                      return (
                        <label key={c.code} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/30 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => setExcludedCountries(prev => checked ? prev.filter(x => x !== c.code) : [...prev, c.code])}
                          />
                          <span>{c.flag}</span>
                          <span className="truncate">{c.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </FormSection>

        {/* ───── Section 4 — Logistics + Quality ──────────────────────── */}
        <FormSection
          number={industry !== 'other' && INDUSTRY_SUBCATEGORIES[industry]?.length > 0 ? 4 : 3}
          title={isEN ? 'Logistics & quality' : 'Logistyka i jakość'}
          subtitle={isEN ? 'Certificates, MOQ, lead time, Incoterms.' : 'Certyfikaty, MOQ, lead time, Incoterms.'}
        >
          {/* Certificates — user picks freely. No pre-locked / forced certs;
              suggestions surface common ones for the branch. */}
          <div>
            <label className="block text-sm font-medium mb-2">{t.campaigns.wizard.search.certificates}</label>
            <TagInput
              value={certificates}
              onChange={setCertificates}
              placeholder={t.campaigns.wizard.search.certificatesPlaceholder}
              suggestions={certSuggestions}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              {isEN
                ? 'Empty = any certification is acceptable. Add only what you genuinely need.'
                : 'Puste = każdy certyfikat jest OK. Dodaj tylko to, czego naprawdę potrzebujesz.'}
            </p>
          </div>

          {/* Incoterms — product/mixed only */}
          {isProductish && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {t.campaigns.wizard.logistics.incoterms}
                <span className="text-muted-foreground font-normal ml-1">({t.campaigns.wizard.search.multiSelect})</span>
              </label>
              <TooltipProvider delayDuration={200}>
                <div className="grid grid-cols-3 gap-2">
                  {INCOTERMS_OPTIONS.map((term) => {
                    const isChecked = selectedIncoterms.includes(term.value);
                    return (
                      <button
                        key={term.value}
                        type="button"
                        onClick={() => setSelectedIncoterms(prev => isChecked ? prev.filter(v => v !== term.value) : [...prev, term.value])}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-all',
                          isChecked ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-input hover:border-primary/40'
                        )}
                      >
                        <span>{term.label}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground ml-1 shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[250px]">
                            <p>{term.desc}</p>
                          </TooltipContent>
                        </Tooltip>
                      </button>
                    );
                  })}
                </div>
              </TooltipProvider>
            </div>
          )}

          {/* MOQ + Lead time — applied at RFQ stage in the supplier portal,
              NOT as a hard filter on sourcing search. Suppliers above the limit
              just get blocked from offering, not from being found. */}
          {showMoqLeadTime && (
            <div className="grid grid-cols-2 gap-4">
              <Field id="moq" label={isEN ? 'MOQ ceiling (optional)' : 'Maks. MOQ (opcjonalne)'} optional>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.moq ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, moq: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  placeholder={isEN ? 'e.g. 500' : 'np. 500'}
                  className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isEN ? 'Applied at RFQ stage — supplier portal blocks offers above this MOQ.' : 'Stosowane na etapie RFQ — portal dostawcy blokuje oferty powyżej tego MOQ.'}
                </p>
              </Field>
              <Field id="leadTimeWeeks" label={isEN ? 'Max lead time (weeks, optional)' : 'Maks. lead time (tygodnie, opcjonalne)'} optional>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.leadTimeWeeks ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, leadTimeWeeks: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  placeholder={isEN ? 'e.g. 4' : 'np. 4'}
                  className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isEN ? 'Applied at RFQ stage — supplier portal blocks offers above this lead time.' : 'Stosowane na etapie RFQ — portal dostawcy blokuje oferty z dłuższym lead time.'}
                </p>
              </Field>
            </div>
          )}

          {/* Delivery date + location */}
          {isProductish && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="desiredDeliveryDate" label={t.campaigns.wizard.logistics.deliveryDateLabel} optional>
                <input
                  type="date"
                  value={formData.desiredDeliveryDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, desiredDeliveryDate: e.target.value }))}
                  className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </Field>
              <Field id="deliveryLocationId" label={t.campaigns.wizard.logistics.deliveryLocation} optional>
                <select
                  value={formData.deliveryLocationId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryLocationId: e.target.value }))}
                  className="w-full px-3 py-2.5 border rounded-md bg-background text-sm"
                >
                  <option value="">{t.campaigns.wizard.logistics.selectLocation}</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name} — {loc.address}</option>
                  ))}
                </select>
                {locations.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">{t.campaigns.wizard.logistics.noLocations}</p>
                )}
              </Field>
            </div>
          )}

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium mb-1.5">{t.campaigns.wizard.upload.title}</label>
            {selectedDocs.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {selectedDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2 rounded-md border p-2 text-sm bg-muted/30">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate">{doc.originalName}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedDocs((prev) => prev.filter((d) => d.id !== doc.id))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <FileUpload value={attachments} onChange={setAttachments} createDocumentRecord entityType="campaign" />
          </div>
        </FormSection>

        {/* ───── Section 5 — Outreach (full plan) ─────────────────────── */}
        {isFullPlan && sequences.length > 0 && (
          <FormSection
            number={industry !== 'other' && INDUSTRY_SUBCATEGORIES[industry]?.length > 0 ? 5 : 4}
            title={t.sequences.emailConfig}
            subtitle={isEN ? 'Email sequence sent to suppliers.' : 'Sekwencja maili do dostawców.'}
          >
            <Alert className="bg-primary/5 text-primary border-primary/20">
              <Globe2 className="h-4 w-4" />
              <AlertDescription>{t.campaigns.wizard.email.translationNotice}</AlertDescription>
            </Alert>

            <Field id="sequenceTemplateId" label={<><Mail className="inline-block w-4 h-4 mr-1" />{t.sequences.selectTemplate}</>}>
              <select
                value={formData.sequenceTemplateId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, sequenceTemplateId: e.target.value }))}
                className="w-full px-3 py-2.5 border rounded-md bg-background text-sm"
              >
                <option value="">{t.sequences.defaultTemplate}</option>
                {sequences.map((seq) => (
                  <option key={seq.id} value={seq.id}>{seq.name}</option>
                ))}
              </select>
            </Field>

            {(() => {
              const selectedId = formData.sequenceTemplateId;
              const selected = sequences.find(s => s.id === selectedId);
              if (!selected) return null;
              return (
                <div>
                  <h4 className="text-sm font-medium mb-2">{t.sequences.preview}</h4>
                  <EmailPreview
                    stepId={selected.steps[0]?.id}
                    organizationId={user?.organizationId || undefined}
                    sampleData={{
                      productName: formData.productName || formData.brief?.slice(0, 50) || t.campaigns.wizard.email.sampleProduct,
                      quantity: String(formData.quantity || '1000'),
                      currency: 'EUR',
                    }}
                    showTranslationNotice={false}
                    className="max-h-[300px] overflow-y-auto"
                  />
                </div>
              );
            })()}
          </FormSection>
        )}

        {/* ───── Sticky bottom CTA ────────────────────────────────────── */}
        <div className="fixed bottom-0 inset-x-0 z-30 bg-background/95 backdrop-blur border-t">
          <div className="max-w-4xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground">
              {isEN ? '1 search credit · campaign starts in ~30s' : '1 kredyt · kampania startuje w ~30s'}
            </div>
            <Button
              type="button"
              size="lg"
              onClick={handleSubmit}
              disabled={submitting || createMutation.isPending}
            >
              {submitting || createMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t.campaigns.wizard.creating}</>
              ) : (
                <><Rocket className="h-4 w-4 mr-2" />{t.campaigns.wizard.summary.launch}</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Sub-components (file-internal, scoped state-free) ───────────────────────

function FormSection({ number, title, subtitle, children }: {
  number: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8 pb-8 border-b last:border-b-0">
      <header className="flex items-baseline gap-3 mb-4">
        <span className="font-mono text-xs text-muted-foreground tabular-nums">{String(number).padStart(2, '0')}</span>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ id, label, required, optional, error, children }: {
  id: string;
  label: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div id={`field-${id}`}>
      <label htmlFor={id} className="block text-sm font-medium mb-1.5">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
        {optional && <span className="text-muted-foreground font-normal ml-1">({t.common.optional})</span>}
      </label>
      {children}
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
}

// Reusable pill picker for industry-specific single-select fields (event type,
// construction stage, MRO urgency etc.). Click again on selected = clear.
function BranchPills({ label, options, value, onChange, isEN }: {
  label: string;
  options: { value: string; pl: string; en: string }[];
  value?: string;
  onChange: (v?: string) => void;
  isEN: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {options.map(opt => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(selected ? undefined : opt.value)}
              className={cn(
                'px-3 py-2 rounded-lg border-2 text-xs text-left transition-all',
                selected ? 'border-primary bg-primary/5 text-primary font-medium ring-2 ring-primary/20' : 'border-input hover:border-primary/40'
              )}
            >
              {isEN ? opt.en : opt.pl}
            </button>
          );
        })}
      </div>
    </div>
  );
}
