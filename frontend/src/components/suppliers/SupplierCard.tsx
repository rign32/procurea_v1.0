import { Mail, Award, MapPin, ExternalLink, XCircle, Globe, ChevronRight, ShieldAlert, Users, Factory, Store } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Supplier } from '@/types/supplier.types';
import { t } from '@/i18n';
import { normalizeCountry, getCountryFlag } from '@/utils/normalize-country';

interface SupplierCardProps {
  supplier: Supplier;
  onClick?: () => void;
  showActions?: boolean;
  onSendRfq?: () => void;
  onExclude?: () => void;
  onBlacklist?: () => void;
}

export function SupplierCard({
  supplier,
  onClick,
  showActions = true,
  onSendRfq,
  onExclude,
  onBlacklist,
}: SupplierCardProps) {
  const score = supplier.analysisScore ? Math.round(supplier.analysisScore * 10) : 0;

  const getScoreVariant = (score: number): 'default' | 'secondary' | 'destructive' => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <Card
      className={`group hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col h-full bg-gradient-to-b from-background to-muted/10 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-bold leading-tight truncate group-hover:text-primary transition-colors" title={supplier.name}>
                {supplier.name || 'Nieznany dostawca'}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <MapPin className="h-3.5 w-3.5 text-primary/70" />
              <span className="truncate">
                {getCountryFlag(supplier.country)} {normalizeCountry(supplier.country)}
                {supplier.city ? `, ${supplier.city}` : ''}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant={getScoreVariant(score)} className="font-bold text-sm px-2.5 py-0.5 shadow-sm">
              {score}%
            </Badge>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Dopasowanie</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-4 flex-1">
        {/* Status Chips */}
        <div className="flex flex-wrap gap-2">
          {supplier.companyType && supplier.companyType !== 'NIEJASNY' && (
            <Badge
              variant="secondary"
              className={`font-normal text-xs transition-colors ${
                supplier.companyType === 'PRODUCENT'
                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              {supplier.companyType === 'PRODUCENT' ? (
                <Factory className="mr-1.5 h-3 w-3" />
              ) : (
                <Store className="mr-1.5 h-3 w-3" />
              )}
              {supplier.companyType === 'PRODUCENT' ? 'Producent' : 'Handlowiec'}
            </Badge>
          )}
          {supplier.certificates && (
            <Badge variant="secondary" className="font-normal text-xs bg-muted/60 hover:bg-muted text-muted-foreground transition-colors max-w-full" title={supplier.certificates}>
              <Award className="mr-1.5 h-3 w-3 flex-shrink-0" />
              <span className="truncate max-w-[120px]">
                {supplier.certificates.split(',')[0]}
                {supplier.certificates.split(',').length > 1 && ' +'}
              </span>
            </Badge>
          )}
          {supplier.employeeCount && supplier.employeeCount !== 'N/A' && (
            <Badge variant="secondary" className="font-normal text-xs bg-muted/60 hover:bg-muted text-muted-foreground transition-colors">
              <Users className="mr-1.5 h-3 w-3" />
              {supplier.employeeCount}
            </Badge>
          )}
        </div>

        {supplier.specialization && (
          <p className="text-sm text-foreground/80 line-clamp-2 leading-relaxed">
            {supplier.specialization}
          </p>
        )}

        {supplier.website && (
          <a
            href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors mt-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="truncate max-w-[200px]">{supplier.website.replace(/^https?:\/\//, '')}</span>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </a>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="gap-2 pt-0 mt-auto">
          <Button
            size="sm"
            variant="ghost"
            className="flex-1 bg-muted/50 hover:bg-muted border border-transparent hover:border-border"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            {t.common.viewDetails}
            <ChevronRight className="ml-1 h-4 w-4 opacity-50" />
          </Button>
          {onSendRfq && (
            <Button
              size="sm"
              className="flex-1 shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onSendRfq();
              }}
            >
              <Mail className="mr-1.5 h-4 w-4" />
              {t.suppliers.card.sendRFQ}
            </Button>
          )}
          {onExclude && (
            <Button
              size="sm"
              variant="destructive"
              className="flex-shrink-0 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-0"
              onClick={(e) => {
                e.stopPropagation();
                onExclude();
              }}
              title="Wyklucz"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
          {onBlacklist && (
            <Button
              size="sm"
              variant="destructive"
              className="flex-shrink-0 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-0 ml-2"
              onClick={(e) => {
                e.stopPropagation();
                onBlacklist();
              }}
              title="Dodaj do Blacklisty"
            >
              <ShieldAlert className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

export default SupplierCard;
