import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { VatMetadata } from '@/utils/supplier-metadata';

interface VatVerifiedBadgeProps {
  vat: VatMetadata;
  compact?: boolean;
}

export function VatVerifiedBadge({ vat, compact }: VatVerifiedBadgeProps) {
  if (vat.vatVerified) {
    const tooltip = [
      `VIES: ${vat.vatCountry}${vat.vatNumber}`,
      vat.registeredName ? `Zarejestrowana: ${vat.registeredName}` : null,
      vat.registeredAddress ? vat.registeredAddress : null,
      `Sprawdzono: ${vat.checkedAt.slice(0, 10)}`,
    ].filter(Boolean).join(' · ');
    return (
      <Badge
        variant="outline"
        className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200"
        title={tooltip}
      >
        <ShieldCheck className="h-3 w-3 mr-1" />
        {compact ? 'VIES' : 'VAT zweryfikowany w VIES'}
      </Badge>
    );
  }
  // Explicit NOT verified — only render when we actually checked and got a negative result.
  return (
    <Badge
      variant="outline"
      className="text-[10px] bg-rose-50 text-rose-700 border-rose-200"
      title={`VIES zwróciło INVALID dla ${vat.vatCountry}${vat.vatNumber}. Ręcznie sprawdź czy numer jest poprawny.`}
    >
      <ShieldAlert className="h-3 w-3 mr-1" />
      {compact ? 'VAT ?' : 'VAT nie potwierdzony w VIES'}
    </Badge>
  );
}
