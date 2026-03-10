import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Loader2, Mail, HelpCircle, Globe2, X, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import { analytics } from '@/lib/analytics';
import type { CreateCampaignDto, OrganizationLocation, Region } from '@/types/campaign.types';

// Zod schemas — 4 steps
const optionalNumber = z.preprocess(
  (val) => (val === '' || val === undefined || val === null || Number.isNaN(val) ? undefined : Number(val)),
  z.number().optional()
);

const step1Schema = z.object({
  productName: z.string().min(2, t.campaigns.wizard.validation.min2Chars).max(200, t.campaigns.wizard.validation.max200Chars),
  material: z.string().max(100).optional(),
  quantity: z.preprocess(
    (val) => (val === '' || val === undefined || val === null || Number.isNaN(val) ? undefined : Number(val)),
    z.number().min(1, t.campaigns.wizard.validation.min1).optional()
  ),
  unit: z.string().max(20).optional(),
  eau: optionalNumber,
  partNumber: z.string().max(100).optional(),
  description: z.string().max(1000, t.campaigns.wizard.validation.max1000Chars).optional(),
});

const step2Schema = z.object({
  targetRegion: z.enum(['PL', 'EU', 'GLOBAL', 'GLOBAL_NO_CN', 'CUSTOM'], { error: t.campaigns.wizard.validation.selectRegion }),
  incoterms: z.string().optional(),
  desiredDeliveryDate: z.string().optional(),
  deliveryLocationId: z.string().optional(),
  supplierTypes: z.array(z.string()).optional(),
});

const step3Schema = z.object({
  sequenceTemplateId: z.string().optional(),
});

const COUNTRIES_PL: { code: string; name: string; flag: string; group: string }[] = [
  // Europa
  { code: 'PL', name: 'Polska', flag: '\u{1F1F5}\u{1F1F1}', group: 'Europa' },
  { code: 'DE', name: 'Niemcy', flag: '\u{1F1E9}\u{1F1EA}', group: 'Europa' },
  { code: 'CZ', name: 'Czechy', flag: '\u{1F1E8}\u{1F1FF}', group: 'Europa' },
  { code: 'SK', name: 'S\u0142owacja', flag: '\u{1F1F8}\u{1F1F0}', group: 'Europa' },
  { code: 'AT', name: 'Austria', flag: '\u{1F1E6}\u{1F1F9}', group: 'Europa' },
  { code: 'FR', name: 'Francja', flag: '\u{1F1EB}\u{1F1F7}', group: 'Europa' },
  { code: 'IT', name: 'W\u0142ochy', flag: '\u{1F1EE}\u{1F1F9}', group: 'Europa' },
  { code: 'ES', name: 'Hiszpania', flag: '\u{1F1EA}\u{1F1F8}', group: 'Europa' },
  { code: 'PT', name: 'Portugalia', flag: '\u{1F1F5}\u{1F1F9}', group: 'Europa' },
  { code: 'NL', name: 'Holandia', flag: '\u{1F1F3}\u{1F1F1}', group: 'Europa' },
  { code: 'BE', name: 'Belgia', flag: '\u{1F1E7}\u{1F1EA}', group: 'Europa' },
  { code: 'CH', name: 'Szwajcaria', flag: '\u{1F1E8}\u{1F1ED}', group: 'Europa' },
  { code: 'SE', name: 'Szwecja', flag: '\u{1F1F8}\u{1F1EA}', group: 'Europa' },
  { code: 'DK', name: 'Dania', flag: '\u{1F1E9}\u{1F1F0}', group: 'Europa' },
  { code: 'NO', name: 'Norwegia', flag: '\u{1F1F3}\u{1F1F4}', group: 'Europa' },
  { code: 'FI', name: 'Finlandia', flag: '\u{1F1EB}\u{1F1EE}', group: 'Europa' },
  { code: 'HU', name: 'W\u0119gry', flag: '\u{1F1ED}\u{1F1FA}', group: 'Europa' },
  { code: 'RO', name: 'Rumunia', flag: '\u{1F1F7}\u{1F1F4}', group: 'Europa' },
  { code: 'BG', name: 'Bu\u0142garia', flag: '\u{1F1E7}\u{1F1EC}', group: 'Europa' },
  { code: 'HR', name: 'Chorwacja', flag: '\u{1F1ED}\u{1F1F7}', group: 'Europa' },
  { code: 'SI', name: 'S\u0142owenia', flag: '\u{1F1F8}\u{1F1EE}', group: 'Europa' },
  { code: 'LT', name: 'Litwa', flag: '\u{1F1F1}\u{1F1F9}', group: 'Europa' },
  { code: 'LV', name: '\u0141otwa', flag: '\u{1F1F1}\u{1F1FB}', group: 'Europa' },
  { code: 'EE', name: 'Estonia', flag: '\u{1F1EA}\u{1F1EA}', group: 'Europa' },
  { code: 'IE', name: 'Irlandia', flag: '\u{1F1EE}\u{1F1EA}', group: 'Europa' },
  { code: 'GB', name: 'Wielka Brytania', flag: '\u{1F1EC}\u{1F1E7}', group: 'Europa' },
  { code: 'GR', name: 'Grecja', flag: '\u{1F1EC}\u{1F1F7}', group: 'Europa' },
  { code: 'UA', name: 'Ukraina', flag: '\u{1F1FA}\u{1F1E6}', group: 'Europa' },
  { code: 'RS', name: 'Serbia', flag: '\u{1F1F7}\u{1F1F8}', group: 'Europa' },
  { code: 'BA', name: 'Bo\u015Bnia i Hercegowina', flag: '\u{1F1E7}\u{1F1E6}', group: 'Europa' },
  { code: 'ME', name: 'Czarnog\u00F3ra', flag: '\u{1F1F2}\u{1F1EA}', group: 'Europa' },
  { code: 'MK', name: 'Macedonia P\u00F3\u0142nocna', flag: '\u{1F1F2}\u{1F1F0}', group: 'Europa' },
  { code: 'AL', name: 'Albania', flag: '\u{1F1E6}\u{1F1F1}', group: 'Europa' },
  { code: 'XK', name: 'Kosowo', flag: '\u{1F1FD}\u{1F1F0}', group: 'Europa' },
  { code: 'MD', name: 'Mo\u0142dawia', flag: '\u{1F1F2}\u{1F1E9}', group: 'Europa' },
  { code: 'CY', name: 'Cypr', flag: '\u{1F1E8}\u{1F1FE}', group: 'Europa' },
  { code: 'MT', name: 'Malta', flag: '\u{1F1F2}\u{1F1F9}', group: 'Europa' },
  { code: 'LU', name: 'Luksemburg', flag: '\u{1F1F1}\u{1F1FA}', group: 'Europa' },
  { code: 'IS', name: 'Islandia', flag: '\u{1F1EE}\u{1F1F8}', group: 'Europa' },
  { code: 'GE', name: 'Gruzja', flag: '\u{1F1EC}\u{1F1EA}', group: 'Europa' },
  { code: 'AM', name: 'Armenia', flag: '\u{1F1E6}\u{1F1F2}', group: 'Europa' },
  { code: 'AZ', name: 'Azerbejd\u017Can', flag: '\u{1F1E6}\u{1F1FF}', group: 'Europa' },
  // Azja
  { code: 'CN', name: 'Chiny', flag: '\u{1F1E8}\u{1F1F3}', group: 'Azja' },
  { code: 'JP', name: 'Japonia', flag: '\u{1F1EF}\u{1F1F5}', group: 'Azja' },
  { code: 'KR', name: 'Korea Po\u0142udniowa', flag: '\u{1F1F0}\u{1F1F7}', group: 'Azja' },
  { code: 'IN', name: 'Indie', flag: '\u{1F1EE}\u{1F1F3}', group: 'Azja' },
  { code: 'TW', name: 'Tajwan', flag: '\u{1F1F9}\u{1F1FC}', group: 'Azja' },
  { code: 'VN', name: 'Wietnam', flag: '\u{1F1FB}\u{1F1F3}', group: 'Azja' },
  { code: 'TH', name: 'Tajlandia', flag: '\u{1F1F9}\u{1F1ED}', group: 'Azja' },
  { code: 'MY', name: 'Malezja', flag: '\u{1F1F2}\u{1F1FE}', group: 'Azja' },
  { code: 'ID', name: 'Indonezja', flag: '\u{1F1EE}\u{1F1E9}', group: 'Azja' },
  { code: 'TR', name: 'Turcja', flag: '\u{1F1F9}\u{1F1F7}', group: 'Azja' },
  { code: 'PH', name: 'Filipiny', flag: '\u{1F1F5}\u{1F1ED}', group: 'Azja' },
  { code: 'SG', name: 'Singapur', flag: '\u{1F1F8}\u{1F1EC}', group: 'Azja' },
  { code: 'BD', name: 'Bangladesz', flag: '\u{1F1E7}\u{1F1E9}', group: 'Azja' },
  { code: 'PK', name: 'Pakistan', flag: '\u{1F1F5}\u{1F1F0}', group: 'Azja' },
  { code: 'LK', name: 'Sri Lanka', flag: '\u{1F1F1}\u{1F1F0}', group: 'Azja' },
  { code: 'KH', name: 'Kambod\u017Ca', flag: '\u{1F1F0}\u{1F1ED}', group: 'Azja' },
  { code: 'NP', name: 'Nepal', flag: '\u{1F1F3}\u{1F1F5}', group: 'Azja' },
  { code: 'MN', name: 'Mongolia', flag: '\u{1F1F2}\u{1F1F3}', group: 'Azja' },
  { code: 'KZ', name: 'Kazachstan', flag: '\u{1F1F0}\u{1F1FF}', group: 'Azja' },
  { code: 'UZ', name: 'Uzbekistan', flag: '\u{1F1FA}\u{1F1FF}', group: 'Azja' },
  { code: 'AE', name: 'Zjednoczone Emiraty Arabskie', flag: '\u{1F1E6}\u{1F1EA}', group: 'Azja' },
  { code: 'SA', name: 'Arabia Saudyjska', flag: '\u{1F1F8}\u{1F1E6}', group: 'Azja' },
  { code: 'IL', name: 'Izrael', flag: '\u{1F1EE}\u{1F1F1}', group: 'Azja' },
  { code: 'JO', name: 'Jordania', flag: '\u{1F1EF}\u{1F1F4}', group: 'Azja' },
  { code: 'LB', name: 'Liban', flag: '\u{1F1F1}\u{1F1E7}', group: 'Azja' },
  { code: 'OM', name: 'Oman', flag: '\u{1F1F4}\u{1F1F2}', group: 'Azja' },
  { code: 'QA', name: 'Katar', flag: '\u{1F1F6}\u{1F1E6}', group: 'Azja' },
  { code: 'BH', name: 'Bahrajn', flag: '\u{1F1E7}\u{1F1ED}', group: 'Azja' },
  { code: 'KW', name: 'Kuwejt', flag: '\u{1F1F0}\u{1F1FC}', group: 'Azja' },
  { code: 'IQ', name: 'Irak', flag: '\u{1F1EE}\u{1F1F6}', group: 'Azja' },
  { code: 'LA', name: 'Laos', flag: '\u{1F1F1}\u{1F1E6}', group: 'Azja' },
  // Afryka
  { code: 'ZA', name: 'RPA', flag: '\u{1F1FF}\u{1F1E6}', group: 'Afryka' },
  { code: 'EG', name: 'Egipt', flag: '\u{1F1EA}\u{1F1EC}', group: 'Afryka' },
  { code: 'MA', name: 'Maroko', flag: '\u{1F1F2}\u{1F1E6}', group: 'Afryka' },
  { code: 'NG', name: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}', group: 'Afryka' },
  { code: 'KE', name: 'Kenia', flag: '\u{1F1F0}\u{1F1EA}', group: 'Afryka' },
  { code: 'TN', name: 'Tunezja', flag: '\u{1F1F9}\u{1F1F3}', group: 'Afryka' },
  { code: 'GH', name: 'Ghana', flag: '\u{1F1EC}\u{1F1ED}', group: 'Afryka' },
  { code: 'ET', name: 'Etiopia', flag: '\u{1F1EA}\u{1F1F9}', group: 'Afryka' },
  { code: 'TZ', name: 'Tanzania', flag: '\u{1F1F9}\u{1F1FF}', group: 'Afryka' },
  { code: 'DZ', name: 'Algieria', flag: '\u{1F1E9}\u{1F1FF}', group: 'Afryka' },
  { code: 'SN', name: 'Senegal', flag: '\u{1F1F8}\u{1F1F3}', group: 'Afryka' },
  { code: 'CI', name: 'Wybrze\u017Ce Ko\u015Bci S\u0142oniowej', flag: '\u{1F1E8}\u{1F1EE}', group: 'Afryka' },
  { code: 'CM', name: 'Kamerun', flag: '\u{1F1E8}\u{1F1F2}', group: 'Afryka' },
  { code: 'UG', name: 'Uganda', flag: '\u{1F1FA}\u{1F1EC}', group: 'Afryka' },
  { code: 'MZ', name: 'Mozambik', flag: '\u{1F1F2}\u{1F1FF}', group: 'Afryka' },
  { code: 'AO', name: 'Angola', flag: '\u{1F1E6}\u{1F1F4}', group: 'Afryka' },
  { code: 'CD', name: 'DR Konga', flag: '\u{1F1E8}\u{1F1E9}', group: 'Afryka' },
  { code: 'MG', name: 'Madagaskar', flag: '\u{1F1F2}\u{1F1EC}', group: 'Afryka' },
  { code: 'RW', name: 'Rwanda', flag: '\u{1F1F7}\u{1F1FC}', group: 'Afryka' },
  { code: 'ZM', name: 'Zambia', flag: '\u{1F1FF}\u{1F1F2}', group: 'Afryka' },
  { code: 'ZW', name: 'Zimbabwe', flag: '\u{1F1FF}\u{1F1FC}', group: 'Afryka' },
  { code: 'BW', name: 'Botswana', flag: '\u{1F1E7}\u{1F1FC}', group: 'Afryka' },
  { code: 'NA', name: 'Namibia', flag: '\u{1F1F3}\u{1F1E6}', group: 'Afryka' },
  { code: 'MU', name: 'Mauritius', flag: '\u{1F1F2}\u{1F1FA}', group: 'Afryka' },
  { code: 'LY', name: 'Libia', flag: '\u{1F1F1}\u{1F1FE}', group: 'Afryka' },
  { code: 'ML', name: 'Mali', flag: '\u{1F1F2}\u{1F1F1}', group: 'Afryka' },
  { code: 'BF', name: 'Burkina Faso', flag: '\u{1F1E7}\u{1F1EB}', group: 'Afryka' },
  { code: 'NE', name: 'Niger', flag: '\u{1F1F3}\u{1F1EA}', group: 'Afryka' },
  { code: 'MW', name: 'Malawi', flag: '\u{1F1F2}\u{1F1FC}', group: 'Afryka' },
  // Ameryki
  { code: 'US', name: 'USA', flag: '\u{1F1FA}\u{1F1F8}', group: 'Ameryki' },
  { code: 'CA', name: 'Kanada', flag: '\u{1F1E8}\u{1F1E6}', group: 'Ameryki' },
  { code: 'MX', name: 'Meksyk', flag: '\u{1F1F2}\u{1F1FD}', group: 'Ameryki' },
  { code: 'BR', name: 'Brazylia', flag: '\u{1F1E7}\u{1F1F7}', group: 'Ameryki' },
  { code: 'AR', name: 'Argentyna', flag: '\u{1F1E6}\u{1F1F7}', group: 'Ameryki' },
  { code: 'CL', name: 'Chile', flag: '\u{1F1E8}\u{1F1F1}', group: 'Ameryki' },
  { code: 'CO', name: 'Kolumbia', flag: '\u{1F1E8}\u{1F1F4}', group: 'Ameryki' },
  { code: 'PE', name: 'Peru', flag: '\u{1F1F5}\u{1F1EA}', group: 'Ameryki' },
  { code: 'EC', name: 'Ekwador', flag: '\u{1F1EA}\u{1F1E8}', group: 'Ameryki' },
  { code: 'UY', name: 'Urugwaj', flag: '\u{1F1FA}\u{1F1FE}', group: 'Ameryki' },
  { code: 'PY', name: 'Paragwaj', flag: '\u{1F1F5}\u{1F1FE}', group: 'Ameryki' },
  { code: 'BO', name: 'Boliwia', flag: '\u{1F1E7}\u{1F1F4}', group: 'Ameryki' },
  { code: 'CR', name: 'Kostaryka', flag: '\u{1F1E8}\u{1F1F7}', group: 'Ameryki' },
  { code: 'PA', name: 'Panama', flag: '\u{1F1F5}\u{1F1E6}', group: 'Ameryki' },
  { code: 'DO', name: 'Dominikana', flag: '\u{1F1E9}\u{1F1F4}', group: 'Ameryki' },
  { code: 'GT', name: 'Gwatemala', flag: '\u{1F1EC}\u{1F1F9}', group: 'Ameryki' },
  { code: 'HN', name: 'Honduras', flag: '\u{1F1ED}\u{1F1F3}', group: 'Ameryki' },
  { code: 'SV', name: 'Salwador', flag: '\u{1F1F8}\u{1F1FB}', group: 'Ameryki' },
  { code: 'NI', name: 'Nikaragua', flag: '\u{1F1F3}\u{1F1EE}', group: 'Ameryki' },
  { code: 'JM', name: 'Jamajka', flag: '\u{1F1EF}\u{1F1F2}', group: 'Ameryki' },
  { code: 'TT', name: 'Trynidad i Tobago', flag: '\u{1F1F9}\u{1F1F9}', group: 'Ameryki' },
  // Oceania
  { code: 'AU', name: 'Australia', flag: '\u{1F1E6}\u{1F1FA}', group: 'Oceania' },
  { code: 'NZ', name: 'Nowa Zelandia', flag: '\u{1F1F3}\u{1F1FF}', group: 'Oceania' },
  { code: 'FJ', name: 'Fid\u017Ci', flag: '\u{1F1EB}\u{1F1EF}', group: 'Oceania' },
  { code: 'PG', name: 'Papua Nowa Gwinea', flag: '\u{1F1F5}\u{1F1EC}', group: 'Oceania' },
];

const COUNTRIES_EN: { code: string; name: string; flag: string; group: string }[] = [
  // Europe
  { code: 'AL', name: 'Albania', flag: '\u{1F1E6}\u{1F1F1}', group: 'Europe' },
  { code: 'AM', name: 'Armenia', flag: '\u{1F1E6}\u{1F1F2}', group: 'Europe' },
  { code: 'AT', name: 'Austria', flag: '\u{1F1E6}\u{1F1F9}', group: 'Europe' },
  { code: 'AZ', name: 'Azerbaijan', flag: '\u{1F1E6}\u{1F1FF}', group: 'Europe' },
  { code: 'BE', name: 'Belgium', flag: '\u{1F1E7}\u{1F1EA}', group: 'Europe' },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: '\u{1F1E7}\u{1F1E6}', group: 'Europe' },
  { code: 'BG', name: 'Bulgaria', flag: '\u{1F1E7}\u{1F1EC}', group: 'Europe' },
  { code: 'HR', name: 'Croatia', flag: '\u{1F1ED}\u{1F1F7}', group: 'Europe' },
  { code: 'CY', name: 'Cyprus', flag: '\u{1F1E8}\u{1F1FE}', group: 'Europe' },
  { code: 'CZ', name: 'Czechia', flag: '\u{1F1E8}\u{1F1FF}', group: 'Europe' },
  { code: 'DK', name: 'Denmark', flag: '\u{1F1E9}\u{1F1F0}', group: 'Europe' },
  { code: 'EE', name: 'Estonia', flag: '\u{1F1EA}\u{1F1EA}', group: 'Europe' },
  { code: 'FI', name: 'Finland', flag: '\u{1F1EB}\u{1F1EE}', group: 'Europe' },
  { code: 'FR', name: 'France', flag: '\u{1F1EB}\u{1F1F7}', group: 'Europe' },
  { code: 'GE', name: 'Georgia', flag: '\u{1F1EC}\u{1F1EA}', group: 'Europe' },
  { code: 'DE', name: 'Germany', flag: '\u{1F1E9}\u{1F1EA}', group: 'Europe' },
  { code: 'GR', name: 'Greece', flag: '\u{1F1EC}\u{1F1F7}', group: 'Europe' },
  { code: 'HU', name: 'Hungary', flag: '\u{1F1ED}\u{1F1FA}', group: 'Europe' },
  { code: 'IS', name: 'Iceland', flag: '\u{1F1EE}\u{1F1F8}', group: 'Europe' },
  { code: 'IE', name: 'Ireland', flag: '\u{1F1EE}\u{1F1EA}', group: 'Europe' },
  { code: 'IT', name: 'Italy', flag: '\u{1F1EE}\u{1F1F9}', group: 'Europe' },
  { code: 'XK', name: 'Kosovo', flag: '\u{1F1FD}\u{1F1F0}', group: 'Europe' },
  { code: 'LV', name: 'Latvia', flag: '\u{1F1F1}\u{1F1FB}', group: 'Europe' },
  { code: 'LT', name: 'Lithuania', flag: '\u{1F1F1}\u{1F1F9}', group: 'Europe' },
  { code: 'LU', name: 'Luxembourg', flag: '\u{1F1F1}\u{1F1FA}', group: 'Europe' },
  { code: 'MT', name: 'Malta', flag: '\u{1F1F2}\u{1F1F9}', group: 'Europe' },
  { code: 'MD', name: 'Moldova', flag: '\u{1F1F2}\u{1F1E9}', group: 'Europe' },
  { code: 'ME', name: 'Montenegro', flag: '\u{1F1F2}\u{1F1EA}', group: 'Europe' },
  { code: 'NL', name: 'Netherlands', flag: '\u{1F1F3}\u{1F1F1}', group: 'Europe' },
  { code: 'MK', name: 'North Macedonia', flag: '\u{1F1F2}\u{1F1F0}', group: 'Europe' },
  { code: 'NO', name: 'Norway', flag: '\u{1F1F3}\u{1F1F4}', group: 'Europe' },
  { code: 'PL', name: 'Poland', flag: '\u{1F1F5}\u{1F1F1}', group: 'Europe' },
  { code: 'PT', name: 'Portugal', flag: '\u{1F1F5}\u{1F1F9}', group: 'Europe' },
  { code: 'RO', name: 'Romania', flag: '\u{1F1F7}\u{1F1F4}', group: 'Europe' },
  { code: 'RS', name: 'Serbia', flag: '\u{1F1F7}\u{1F1F8}', group: 'Europe' },
  { code: 'SK', name: 'Slovakia', flag: '\u{1F1F8}\u{1F1F0}', group: 'Europe' },
  { code: 'SI', name: 'Slovenia', flag: '\u{1F1F8}\u{1F1EE}', group: 'Europe' },
  { code: 'ES', name: 'Spain', flag: '\u{1F1EA}\u{1F1F8}', group: 'Europe' },
  { code: 'SE', name: 'Sweden', flag: '\u{1F1F8}\u{1F1EA}', group: 'Europe' },
  { code: 'CH', name: 'Switzerland', flag: '\u{1F1E8}\u{1F1ED}', group: 'Europe' },
  { code: 'UA', name: 'Ukraine', flag: '\u{1F1FA}\u{1F1E6}', group: 'Europe' },
  { code: 'GB', name: 'United Kingdom', flag: '\u{1F1EC}\u{1F1E7}', group: 'Europe' },
  // Asia
  { code: 'BH', name: 'Bahrain', flag: '\u{1F1E7}\u{1F1ED}', group: 'Asia' },
  { code: 'BD', name: 'Bangladesh', flag: '\u{1F1E7}\u{1F1E9}', group: 'Asia' },
  { code: 'KH', name: 'Cambodia', flag: '\u{1F1F0}\u{1F1ED}', group: 'Asia' },
  { code: 'CN', name: 'China', flag: '\u{1F1E8}\u{1F1F3}', group: 'Asia' },
  { code: 'IN', name: 'India', flag: '\u{1F1EE}\u{1F1F3}', group: 'Asia' },
  { code: 'ID', name: 'Indonesia', flag: '\u{1F1EE}\u{1F1E9}', group: 'Asia' },
  { code: 'IQ', name: 'Iraq', flag: '\u{1F1EE}\u{1F1F6}', group: 'Asia' },
  { code: 'IL', name: 'Israel', flag: '\u{1F1EE}\u{1F1F1}', group: 'Asia' },
  { code: 'JP', name: 'Japan', flag: '\u{1F1EF}\u{1F1F5}', group: 'Asia' },
  { code: 'JO', name: 'Jordan', flag: '\u{1F1EF}\u{1F1F4}', group: 'Asia' },
  { code: 'KZ', name: 'Kazakhstan', flag: '\u{1F1F0}\u{1F1FF}', group: 'Asia' },
  { code: 'KW', name: 'Kuwait', flag: '\u{1F1F0}\u{1F1FC}', group: 'Asia' },
  { code: 'LA', name: 'Laos', flag: '\u{1F1F1}\u{1F1E6}', group: 'Asia' },
  { code: 'LB', name: 'Lebanon', flag: '\u{1F1F1}\u{1F1E7}', group: 'Asia' },
  { code: 'MY', name: 'Malaysia', flag: '\u{1F1F2}\u{1F1FE}', group: 'Asia' },
  { code: 'MN', name: 'Mongolia', flag: '\u{1F1F2}\u{1F1F3}', group: 'Asia' },
  { code: 'NP', name: 'Nepal', flag: '\u{1F1F3}\u{1F1F5}', group: 'Asia' },
  { code: 'OM', name: 'Oman', flag: '\u{1F1F4}\u{1F1F2}', group: 'Asia' },
  { code: 'PK', name: 'Pakistan', flag: '\u{1F1F5}\u{1F1F0}', group: 'Asia' },
  { code: 'PH', name: 'Philippines', flag: '\u{1F1F5}\u{1F1ED}', group: 'Asia' },
  { code: 'QA', name: 'Qatar', flag: '\u{1F1F6}\u{1F1E6}', group: 'Asia' },
  { code: 'SA', name: 'Saudi Arabia', flag: '\u{1F1F8}\u{1F1E6}', group: 'Asia' },
  { code: 'SG', name: 'Singapore', flag: '\u{1F1F8}\u{1F1EC}', group: 'Asia' },
  { code: 'KR', name: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}', group: 'Asia' },
  { code: 'LK', name: 'Sri Lanka', flag: '\u{1F1F1}\u{1F1F0}', group: 'Asia' },
  { code: 'TW', name: 'Taiwan', flag: '\u{1F1F9}\u{1F1FC}', group: 'Asia' },
  { code: 'TH', name: 'Thailand', flag: '\u{1F1F9}\u{1F1ED}', group: 'Asia' },
  { code: 'TR', name: 'Turkey', flag: '\u{1F1F9}\u{1F1F7}', group: 'Asia' },
  { code: 'AE', name: 'United Arab Emirates', flag: '\u{1F1E6}\u{1F1EA}', group: 'Asia' },
  { code: 'UZ', name: 'Uzbekistan', flag: '\u{1F1FA}\u{1F1FF}', group: 'Asia' },
  { code: 'VN', name: 'Vietnam', flag: '\u{1F1FB}\u{1F1F3}', group: 'Asia' },
  // Africa
  { code: 'DZ', name: 'Algeria', flag: '\u{1F1E9}\u{1F1FF}', group: 'Africa' },
  { code: 'AO', name: 'Angola', flag: '\u{1F1E6}\u{1F1F4}', group: 'Africa' },
  { code: 'BW', name: 'Botswana', flag: '\u{1F1E7}\u{1F1FC}', group: 'Africa' },
  { code: 'BF', name: 'Burkina Faso', flag: '\u{1F1E7}\u{1F1EB}', group: 'Africa' },
  { code: 'CM', name: 'Cameroon', flag: '\u{1F1E8}\u{1F1F2}', group: 'Africa' },
  { code: 'CD', name: 'DR Congo', flag: '\u{1F1E8}\u{1F1E9}', group: 'Africa' },
  { code: 'EG', name: 'Egypt', flag: '\u{1F1EA}\u{1F1EC}', group: 'Africa' },
  { code: 'ET', name: 'Ethiopia', flag: '\u{1F1EA}\u{1F1F9}', group: 'Africa' },
  { code: 'GH', name: 'Ghana', flag: '\u{1F1EC}\u{1F1ED}', group: 'Africa' },
  { code: 'CI', name: 'Ivory Coast', flag: '\u{1F1E8}\u{1F1EE}', group: 'Africa' },
  { code: 'KE', name: 'Kenya', flag: '\u{1F1F0}\u{1F1EA}', group: 'Africa' },
  { code: 'LY', name: 'Libya', flag: '\u{1F1F1}\u{1F1FE}', group: 'Africa' },
  { code: 'MG', name: 'Madagascar', flag: '\u{1F1F2}\u{1F1EC}', group: 'Africa' },
  { code: 'MW', name: 'Malawi', flag: '\u{1F1F2}\u{1F1FC}', group: 'Africa' },
  { code: 'ML', name: 'Mali', flag: '\u{1F1F2}\u{1F1F1}', group: 'Africa' },
  { code: 'MU', name: 'Mauritius', flag: '\u{1F1F2}\u{1F1FA}', group: 'Africa' },
  { code: 'MA', name: 'Morocco', flag: '\u{1F1F2}\u{1F1E6}', group: 'Africa' },
  { code: 'MZ', name: 'Mozambique', flag: '\u{1F1F2}\u{1F1FF}', group: 'Africa' },
  { code: 'NA', name: 'Namibia', flag: '\u{1F1F3}\u{1F1E6}', group: 'Africa' },
  { code: 'NE', name: 'Niger', flag: '\u{1F1F3}\u{1F1EA}', group: 'Africa' },
  { code: 'NG', name: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}', group: 'Africa' },
  { code: 'RW', name: 'Rwanda', flag: '\u{1F1F7}\u{1F1FC}', group: 'Africa' },
  { code: 'SN', name: 'Senegal', flag: '\u{1F1F8}\u{1F1F3}', group: 'Africa' },
  { code: 'ZA', name: 'South Africa', flag: '\u{1F1FF}\u{1F1E6}', group: 'Africa' },
  { code: 'TZ', name: 'Tanzania', flag: '\u{1F1F9}\u{1F1FF}', group: 'Africa' },
  { code: 'TN', name: 'Tunisia', flag: '\u{1F1F9}\u{1F1F3}', group: 'Africa' },
  { code: 'UG', name: 'Uganda', flag: '\u{1F1FA}\u{1F1EC}', group: 'Africa' },
  { code: 'ZM', name: 'Zambia', flag: '\u{1F1FF}\u{1F1F2}', group: 'Africa' },
  { code: 'ZW', name: 'Zimbabwe', flag: '\u{1F1FF}\u{1F1FC}', group: 'Africa' },
  // Americas
  { code: 'AR', name: 'Argentina', flag: '\u{1F1E6}\u{1F1F7}', group: 'Americas' },
  { code: 'BO', name: 'Bolivia', flag: '\u{1F1E7}\u{1F1F4}', group: 'Americas' },
  { code: 'BR', name: 'Brazil', flag: '\u{1F1E7}\u{1F1F7}', group: 'Americas' },
  { code: 'CA', name: 'Canada', flag: '\u{1F1E8}\u{1F1E6}', group: 'Americas' },
  { code: 'CL', name: 'Chile', flag: '\u{1F1E8}\u{1F1F1}', group: 'Americas' },
  { code: 'CO', name: 'Colombia', flag: '\u{1F1E8}\u{1F1F4}', group: 'Americas' },
  { code: 'CR', name: 'Costa Rica', flag: '\u{1F1E8}\u{1F1F7}', group: 'Americas' },
  { code: 'DO', name: 'Dominican Republic', flag: '\u{1F1E9}\u{1F1F4}', group: 'Americas' },
  { code: 'EC', name: 'Ecuador', flag: '\u{1F1EA}\u{1F1E8}', group: 'Americas' },
  { code: 'SV', name: 'El Salvador', flag: '\u{1F1F8}\u{1F1FB}', group: 'Americas' },
  { code: 'GT', name: 'Guatemala', flag: '\u{1F1EC}\u{1F1F9}', group: 'Americas' },
  { code: 'HN', name: 'Honduras', flag: '\u{1F1ED}\u{1F1F3}', group: 'Americas' },
  { code: 'JM', name: 'Jamaica', flag: '\u{1F1EF}\u{1F1F2}', group: 'Americas' },
  { code: 'MX', name: 'Mexico', flag: '\u{1F1F2}\u{1F1FD}', group: 'Americas' },
  { code: 'NI', name: 'Nicaragua', flag: '\u{1F1F3}\u{1F1EE}', group: 'Americas' },
  { code: 'PA', name: 'Panama', flag: '\u{1F1F5}\u{1F1E6}', group: 'Americas' },
  { code: 'PY', name: 'Paraguay', flag: '\u{1F1F5}\u{1F1FE}', group: 'Americas' },
  { code: 'PE', name: 'Peru', flag: '\u{1F1F5}\u{1F1EA}', group: 'Americas' },
  { code: 'TT', name: 'Trinidad and Tobago', flag: '\u{1F1F9}\u{1F1F9}', group: 'Americas' },
  { code: 'US', name: 'USA', flag: '\u{1F1FA}\u{1F1F8}', group: 'Americas' },
  { code: 'UY', name: 'Uruguay', flag: '\u{1F1FA}\u{1F1FE}', group: 'Americas' },
  // Oceania
  { code: 'AU', name: 'Australia', flag: '\u{1F1E6}\u{1F1FA}', group: 'Oceania' },
  { code: 'FJ', name: 'Fiji', flag: '\u{1F1EB}\u{1F1EF}', group: 'Oceania' },
  { code: 'NZ', name: 'New Zealand', flag: '\u{1F1F3}\u{1F1FF}', group: 'Oceania' },
  { code: 'PG', name: 'Papua New Guinea', flag: '\u{1F1F5}\u{1F1EC}', group: 'Oceania' },
];

const AVAILABLE_COUNTRIES = isEN ? COUNTRIES_EN : COUNTRIES_PL;

const INCOTERMS_OPTIONS: { value: string; label: string; desc: string }[] = [
  { value: 'EXW', label: 'EXW', desc: t.campaigns.wizard.incotermsOptions.EXW },
  { value: 'FCA', label: 'FCA', desc: t.campaigns.wizard.incotermsOptions.FCA },
  { value: 'DAP', label: 'DAP', desc: t.campaigns.wizard.incotermsOptions.DAP },
  { value: 'DDP', label: 'DDP', desc: t.campaigns.wizard.incotermsOptions.DDP },
  { value: 'FOB', label: 'FOB', desc: t.campaigns.wizard.incotermsOptions.FOB },
  { value: 'CIF', label: 'CIF', desc: t.campaigns.wizard.incotermsOptions.CIF },
];

const REGION_OPTIONS: { value: Region; label: string; icon: string; desc: string }[] = [
  { value: 'PL', label: t.campaigns.wizard.search.regionPL, icon: '\u{1F1F5}\u{1F1F1}', desc: t.campaigns.wizard.search.regionDescPL },
  { value: 'EU', label: t.campaigns.wizard.search.regionEU, icon: '\u{1F1EA}\u{1F1FA}', desc: t.campaigns.wizard.search.regionDescEU },
  { value: 'GLOBAL', label: t.campaigns.wizard.search.regionGLOBAL, icon: '\u{1F30D}', desc: t.campaigns.wizard.search.regionDescGLOBAL },
  { value: 'GLOBAL_NO_CN', label: t.campaigns.wizard.search.regionGLOBAL_NO_CN, icon: '\u{1F30E}', desc: t.campaigns.wizard.search.regionDescGLOBAL_NO_CN },
  { value: 'CUSTOM', label: t.campaigns.wizard.search.regionCustom, icon: '\u{1F4CD}', desc: t.campaigns.wizard.search.regionDescCUSTOM },
];

interface RfqWizardProps {
  onComplete?: (campaignId: string) => void;
}

export function RfqWizard({ onComplete }: RfqWizardProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<CreateCampaignDto>>({ supplierTypes: ['PRODUCENT'] });
  const [sequences, setSequences] = useState<SequenceTemplate[]>([]);
  const [locations, setLocations] = useState<OrganizationLocation[]>([]);
  const [certificates, setCertificates] = useState<string[]>([]);
  const [selectedIncoterms, setSelectedIncoterms] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const { user } = useAuthStore();
  const isFullPlan = user?.plan === 'full';

  const createMutation = useCreateCampaign();
  const submittedRef = useRef(false);

  // Track wizard start + abandonment on unmount
  useEffect(() => {
    analytics.campaignWizardStart();
    analytics.campaignWizardStep(0);
    return () => {
      if (!submittedRef.current) {
        analytics.campaignWizardAbandoned(currentStep);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load sequences and locations
  useEffect(() => {
    sequencesService.getAll().then(setSequences).catch(() => { });
    if (user?.organizationId) {
      organizationService.getLocations(user.organizationId).then((locs) => {
        setLocations(locs);
        // Pre-select default location if none chosen yet
        if (!formData.deliveryLocationId) {
          const defaultLoc = locs.find(l => l.isDefault);
          if (defaultLoc) {
            form.setValue('deliveryLocationId', defaultLoc.id);
          }
        }
      }).catch(() => { });
    }
  }, [user?.organizationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const steps = [
    { id: 'product', label: t.campaigns.wizard.steps.product, schema: step1Schema },
    { id: 'search-logistics', label: t.campaigns.wizard.steps.searchLogistics, schema: step2Schema },
    ...(isFullPlan ? [{ id: 'email', label: t.sequences.emailConfig, schema: step3Schema }] : []),
    { id: 'summary', label: t.campaigns.wizard.step5, schema: z.any() },
  ];

  const currentSchema = steps[currentStep].schema;

  const form = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: formData as any,
    mode: 'onChange',
  });

  // Reset form values when step changes
  useEffect(() => {
    form.reset(formData as any);
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-select first sequence if none selected
  useEffect(() => {
    if (sequences.length > 0 && !form.getValues('sequenceTemplateId')) {
      form.setValue('sequenceTemplateId', sequences[0].id, { shouldValidate: true, shouldDirty: true });
    }
  }, [sequences, form]);

  const handleNext = async (data: any) => {
    const parsed = { ...data };

    // Inject tag-based fields at search step
    if (steps[currentStep]?.id === 'search-logistics') {
      parsed.requiredCertificates = certificates;
      parsed.incoterms = selectedIncoterms.join(',');
      if (parsed.targetRegion === 'CUSTOM') {
        parsed.targetCountries = selectedCountries;
      }
    }

    const newFormData = { ...formData, ...parsed };
    setFormData(newFormData);

    if (currentStep === steps.length - 1) {
      // Auto-generate campaign name from product name
      const finalData: any = {
        ...newFormData,
        name: `${t.campaigns.wizard.email.campaignPrefix}: ${newFormData.productName}`,
        requiredCertificates: certificates,
        incoterms: selectedIncoterms.join(','),
        targetCountries: newFormData.targetRegion === 'CUSTOM' ? selectedCountries : undefined,
      };
      if (attachments.length > 0) {
        finalData.attachments = JSON.stringify(attachments);
      }

      try {
        const result = await createMutation.mutateAsync(finalData as CreateCampaignDto);
        submittedRef.current = true;
        analytics.campaignCreated(newFormData.targetRegion);
        if (onComplete) {
          onComplete(result.id);
        } else {
          navigate(`/campaigns/${result.id}`);
        }
      } catch (error: any) {
        console.error('Failed to create campaign:', error);
        const msg = error?.message || t.campaigns.wizard.validation.createError;
        const isCreditsError = error?.statusCode === 400 && (msg.toLowerCase().includes('kredyt') || msg.toLowerCase().includes('wyszukiw'));
        if (isCreditsError) {
          toast.error(msg, {
            duration: 8000,
            action: { label: t.settings.billing.topUp.action, onClick: () => navigate('/settings?tab=billing') },
          });
        } else {
          toast.error(msg);
        }
      }
    } else {
      analytics.campaignWizardStep(currentStep + 1);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const currentValues = form.getValues();
      if (steps[currentStep]?.id === 'search-logistics') {
        // Save incoterms to formData when going back
        currentValues.incoterms = selectedIncoterms.join(',');
      }
      setFormData(prev => ({ ...prev, ...currentValues }));
      setCurrentStep(currentStep - 1);
    }
  };

  const filteredCountries = countrySearch
    ? AVAILABLE_COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
    : AVAILABLE_COUNTRIES;

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;
  const displayCertificates = certificates.join(', ');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">{steps[currentStep].label}</span>
          <span className="text-muted-foreground">
            {t.campaigns.wizard.stepOf.replace('{current}', String(currentStep + 1)).replace('{total}', String(steps.length))}
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].label}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleNext)} className="space-y-6">

            {/* ===== STEP 1: Produkt i specyfikacja ===== */}
            {steps[currentStep]?.id === 'product' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.campaigns.wizard.basicInfo.productName} *</label>
                  <input type="text" {...form.register('productName')} maxLength={200} placeholder={t.campaigns.wizard.basicInfo.productNamePlaceholder} className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  {form.formState.errors.productName && <p className="text-sm text-destructive mt-1">{form.formState.errors.productName.message as string}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.campaigns.wizard.specs.material}</label>
                  <input type="text" {...form.register('material')} maxLength={100} placeholder={t.campaigns.wizard.specs.materialPlaceholder} className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">{t.campaigns.wizard.specs.quantity}</label>
                    <input type="number" min={1} {...form.register('quantity', { valueAsNumber: true })} placeholder={t.campaigns.wizard.specs.quantityPlaceholder} className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    {form.formState.errors.quantity && <p className="text-sm text-destructive mt-1">{form.formState.errors.quantity.message as string}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">{t.campaigns.wizard.specs.unit}</label>
                    <input type="text" {...form.register('unit')} maxLength={20} defaultValue={t.campaigns.wizard.specs.unitDefault} placeholder={t.campaigns.wizard.specs.unitDefault} className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.campaigns.wizard.specs.eau} <span className="text-muted-foreground font-normal">({t.common.optional})</span></label>
                  <input type="number" {...form.register('eau', { valueAsNumber: true })} placeholder={t.campaigns.wizard.specs.eauPlaceholder} className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.campaigns.wizard.specs.partNumber} <span className="text-muted-foreground font-normal">({t.common.optional})</span></label>
                  <input type="text" {...form.register('partNumber')} maxLength={100} placeholder={t.campaigns.wizard.specs.partNumberPlaceholder} className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.campaigns.wizard.upload.title}</label>
                  <FileUpload value={attachments} onChange={setAttachments} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.campaigns.wizard.basicInfo.description} <span className="text-muted-foreground font-normal">({t.common.optional})</span></label>
                  <textarea {...form.register('description')} maxLength={1000} placeholder={t.campaigns.wizard.basicInfo.descriptionPlaceholder} rows={3} className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
            )}

            {/* ===== STEP 2: Wyszukiwanie i logistyka ===== */}
            {steps[currentStep]?.id === 'search-logistics' && (
              <div className="space-y-6">
                {/* Region — visual radio buttons */}
                <div>
                  <label className="block text-sm font-medium mb-3">{t.campaigns.wizard.search.region}</label>
                  <div className="grid grid-cols-2 gap-3">
                    {REGION_OPTIONS.map((opt) => {
                      const isSelected = form.watch('targetRegion') === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => form.setValue('targetRegion', opt.value, { shouldValidate: true, shouldDirty: true })}
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

                {/* Country picker — shown when CUSTOM selected */}
                {form.watch('targetRegion') === 'CUSTOM' && (
                  <div className="border rounded-lg p-4 space-y-3">
                    {/* Selected countries as badges */}
                    {selectedCountries.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedCountries.map(code => {
                          const c = AVAILABLE_COUNTRIES.find(ac => ac.code === code);
                          return c ? (
                            <Badge key={code} variant="secondary" className="flex items-center gap-1 pr-1">
                              {c.flag} {c.name}
                              <button
                                type="button"
                                onClick={() => setSelectedCountries(prev => prev.filter(p => p !== code))}
                                className="ml-1 rounded-full hover:bg-muted p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                    {/* Search input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder={t.campaigns.wizard.search.searchCountry}
                        className="w-full pl-9 pr-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    {/* Country list */}
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {filteredCountries.map(c => {
                        const isChecked = selectedCountries.includes(c.code);
                        return (
                          <label
                            key={c.code}
                            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setSelectedCountries(prev =>
                                  isChecked ? prev.filter(p => p !== c.code) : [...prev, c.code]
                                );
                              }}
                              className="h-3.5 w-3.5 rounded border-input"
                            />
                            <span>{c.flag}</span>
                            <span>{c.name}</span>
                          </label>
                        );
                      })}
                    </div>
                    {selectedCountries.length === 0 && (
                      <p className="text-xs text-destructive">{t.campaigns.wizard.validation.selectCountry}</p>
                    )}
                  </div>
                )}

                {/* Supplier Types — checkboxes */}
                <div>
                  <label className="block text-sm font-medium mb-2">{t.campaigns.wizard.supplierTypes.title} <span className="text-muted-foreground font-normal">({t.campaigns.wizard.search.multiSelect})</span></label>
                  <div className="space-y-2">
                    {[
                      { value: 'PRODUCENT', label: t.campaigns.wizard.supplierTypes.manufacturer, desc: t.campaigns.wizard.supplierTypes.manufacturerDesc },
                      { value: 'HANDLOWIEC', label: t.campaigns.wizard.supplierTypes.trader, desc: t.campaigns.wizard.supplierTypes.traderDesc },
                    ].map((opt) => {
                      const currentTypes = form.watch('supplierTypes') || ['PRODUCENT'];
                      const isSelected = currentTypes.includes(opt.value);
                      return (
                        <label
                          key={opt.value}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              const current = form.getValues('supplierTypes') || ['PRODUCENT'];
                              const updated = isSelected
                                ? current.filter((t: string) => t !== opt.value)
                                : [...current, opt.value];
                              if (updated.length > 0) {
                                form.setValue('supplierTypes', updated, { shouldValidate: true });
                              }
                            }}
                            className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                          />
                          <div>
                            <p className="font-medium text-sm">{opt.label}</p>
                            <p className="text-xs text-muted-foreground">{opt.desc}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Certificates */}
                <div>
                  <label className="block text-sm font-medium mb-2">{t.campaigns.wizard.search.certificates}</label>
                  <TagInput
                    value={certificates}
                    onChange={setCertificates}
                    placeholder={t.campaigns.wizard.search.certificatesPlaceholder}
                    suggestions={['ISO 9001', 'ISO 14001', 'ISO 13485', 'IATF 16949', 'AS9100', 'CE', 'UL', 'RoHS', 'REACH']}
                  />
                </div>

                {/* Incoterms — multi-select with tooltips */}
                <div>
                  <label className="block text-sm font-medium mb-3">
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
                            onClick={() => {
                              setSelectedIncoterms(prev =>
                                isChecked
                                  ? prev.filter(v => v !== term.value)
                                  : [...prev, term.value]
                              );
                            }}
                            className={cn(
                              'flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-all',
                              isChecked
                                ? 'border-primary bg-primary/5 text-primary font-medium'
                                : 'border-input hover:border-primary/40'
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

                {/* Delivery date */}
                <div>
                  <label className="block text-sm font-medium mb-2">{t.campaigns.wizard.logistics.deliveryDateLabel}</label>
                  <input type="date" {...form.register('desiredDeliveryDate')} className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>

                {/* Delivery location */}
                {isFullPlan && (
                <div>
                  <label className="block text-sm font-medium mb-2">{t.campaigns.wizard.logistics.deliveryLocation}</label>
                  <select {...form.register('deliveryLocationId')} className="w-full px-3 py-2.5 border rounded-md bg-background text-sm">
                    <option value="">{t.campaigns.wizard.logistics.selectLocation}</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} — {loc.address}
                      </option>
                    ))}
                  </select>
                  {locations.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.campaigns.wizard.logistics.noLocations}
                    </p>
                  )}
                </div>
                )}
              </div>
            )}

            {/* ===== STEP 3: Konfiguracja emaili ===== */}
            {steps[currentStep]?.id === 'email' && (
              <div className="space-y-6">
                {/* Translation notice at TOP */}
                <Alert className="bg-primary/5 text-primary border-primary/20">
                  <Globe2 className="h-4 w-4" />
                  <AlertDescription>
                    {t.campaigns.wizard.email.translationNotice}
                  </AlertDescription>
                </Alert>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Mail className="inline-block w-4 h-4 mr-1" />
                    {t.sequences.selectTemplate}
                  </label>
                  <select
                    {...form.register('sequenceTemplateId')}
                    className="w-full px-3 py-2.5 border rounded-md bg-background text-sm"
                  >
                    <option value="">{t.sequences.defaultTemplate}</option>
                    {sequences.map((seq, index) => (
                      <option key={seq.id} value={seq.id}>
                        {seq.name} {seq.isSystem ? `(${t.sequences.system})` : ''}
                        {index === 0 ? ` (${t.campaigns.wizard.email.recommended})` : ''}
                        {' — '}
                        {seq.steps.length} {t.sequences.steps.toLowerCase()}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.campaigns.wizard.email.templateDescription}
                  </p>
                </div>

                {/* Selected template steps preview */}
                {(() => {
                  const selectedId = form.watch('sequenceTemplateId');
                  const selected = sequences.find(s => s.id === selectedId);
                  if (!selected) return null;
                  return (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <h4 className="text-sm font-medium">{t.sequences.steps}:</h4>
                      {selected.steps.map((step) => (
                        <div key={step.id} className="flex items-start gap-3 text-sm">
                          <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium whitespace-nowrap">
                            {t.sequences.day} {step.dayOffset}
                          </span>
                          <div>
                            <p className="font-medium">{step.subject}</p>
                            <p className="text-muted-foreground text-xs line-clamp-2">{step.bodySnippet}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Email preview — without bottom translation notice */}
                <div>
                  <h4 className="text-sm font-medium mb-2">{t.sequences.preview}</h4>
                  <EmailPreview
                    stepId={(() => {
                      const selectedId = form.watch('sequenceTemplateId');
                      const selected = sequences.find(s => s.id === selectedId);
                      return selected?.steps[0]?.id;
                    })()}
                    organizationId={user?.organizationId || undefined}
                    sampleData={{
                      productName: formData.productName || t.campaigns.wizard.email.sampleProduct,
                      quantity: String(formData.quantity || '1000'),
                      currency: 'EUR',
                    }}
                    showTranslationNotice={false}
                    className="max-h-[400px] overflow-y-auto"
                  />
                </div>
              </div>
            )}

            {/* ===== STEP 4: Podsumowanie ===== */}
            {steps[currentStep]?.id === 'summary' && (
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-lg">{t.campaigns.wizard.summary.campaignSummary}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">{t.campaigns.wizard.summary.product}:</span><span className="font-medium">{formData.productName}</span></div>
                    {formData.material && <div className="flex justify-between"><span className="text-muted-foreground">{t.campaigns.wizard.summary.material}:</span><span className="font-medium">{formData.material}</span></div>}
                    {formData.quantity && <div className="flex justify-between"><span className="text-muted-foreground">{t.campaigns.wizard.summary.quantity}:</span><span className="font-medium">{formData.quantity} {formData.unit || t.campaigns.wizard.specs.unitDefault}</span></div>}
                    {formData.targetRegion && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.campaigns.wizard.summary.region}:</span>
                        <span className="font-medium">
                          {formData.targetRegion === 'CUSTOM'
                            ? `\u{1F4CD} ${selectedCountries.map(c => AVAILABLE_COUNTRIES.find(ac => ac.code === c)?.name).filter(Boolean).join(', ')}`
                            : `${REGION_OPTIONS.find(r => r.value === formData.targetRegion)?.icon} ${REGION_OPTIONS.find(r => r.value === formData.targetRegion)?.label}`
                          }
                        </span>
                      </div>
                    )}
                    {displayCertificates && <div className="flex justify-between"><span className="text-muted-foreground">{t.campaigns.wizard.summary.certificates}:</span><span className="font-medium">{displayCertificates}</span></div>}
                    {selectedIncoterms.length > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Incoterms:</span>
                        <div className="flex gap-1">
                          {selectedIncoterms.map((term) => (
                            <Badge key={term} variant="secondary">{term}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {formData.desiredDeliveryDate && <div className="flex justify-between"><span className="text-muted-foreground">{t.campaigns.wizard.summary.deliveryDate}:</span><span className="font-medium">{formData.desiredDeliveryDate}</span></div>}
                    {formData.description && <div className="flex justify-between"><span className="text-muted-foreground">{t.campaigns.wizard.summary.description}:</span><span className="font-medium line-clamp-2">{formData.description}</span></div>}
                  </div>

                  {/* Attachments summary */}
                  {attachments.length > 0 && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="text-sm font-medium mb-2">{t.campaigns.wizard.summary.attachments} ({attachments.length})</h4>
                      <div className="space-y-1">
                        {attachments.map((file: any) => (
                          <p key={file.id} className="text-xs text-muted-foreground">📎 {file.filename}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      {t.campaigns.wizard.summary.launchDescription}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 0 || createMutation.isPending}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.common.back}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t.campaigns.wizard.creating}</>
                ) : currentStep === steps.length - 1 ? (
                  t.campaigns.wizard.summary.launch
                ) : (
                  <>{t.common.next}<ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default RfqWizard;
