import { Building2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ApolloMetadata } from '@/utils/supplier-metadata';

interface Props {
  apollo: ApolloMetadata;
  compact?: boolean;
}

function formatEmployees(n?: number): string | null {
  if (!n || n < 1) return null;
  if (n < 10) return `<10 pracowników`;
  if (n < 50) return `10–50 pracowników`;
  if (n < 200) return `50–200 pracowników`;
  if (n < 500) return `200–500 pracowników`;
  if (n < 1000) return `500–1k pracowników`;
  if (n < 10000) return `1k–10k pracowników`;
  return `10k+ pracowników`;
}

export function ApolloEnrichedBadge({ apollo, compact }: Props) {
  const parts = [
    apollo.industry,
    formatEmployees(apollo.estimatedEmployees),
    apollo.foundedYear ? `od ${apollo.foundedYear}` : null,
  ].filter(Boolean);

  const tooltip = [
    apollo.name ? `Apollo: ${apollo.name}` : 'Apollo enrichment',
    ...parts,
    apollo.linkedinUrl ? apollo.linkedinUrl : null,
    apollo.enrichedAt ? `Pobrano: ${apollo.enrichedAt.slice(0, 10)}` : null,
  ].filter(Boolean).join(' · ');

  if (apollo.employeeMismatch) {
    return (
      <Badge
        variant="outline"
        className="text-[10px] bg-amber-50 text-amber-700 border-amber-200"
        title={`${tooltip} · Niezgodność wielkości firmy ze stroną dostawcy — zweryfikuj.`}
      >
        <AlertTriangle className="h-3 w-3 mr-1" />
        {compact ? 'Apollo ?' : 'Apollo: niezgodność zatrudnienia'}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="text-[10px] bg-sky-50 text-sky-700 border-sky-200"
      title={tooltip}
    >
      <Building2 className="h-3 w-3 mr-1" />
      {compact ? 'Apollo' : parts.slice(0, 2).join(' · ') || 'Apollo enriched'}
    </Badge>
  );
}
