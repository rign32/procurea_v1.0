import { useMemo, useState } from 'react';
import { Calculator, Info, TrendingDown, TrendingUp, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  computeLandedCost,
  compareLandedCost,
  DEFAULT_VAT_RATES,
  DUTY_PRESETS,
  type LandedCostInput,
} from '@/lib/landed-cost';

interface Scenario extends LandedCostInput {
  label: string;
}

const EMPTY_SCENARIO = (label: string): Scenario => ({
  label,
  fobUnitPrice: 0,
  quantity: 1,
  currency: 'EUR',
  freightTotal: 0,
  insuranceTotal: 0,
  inlandTransportTotal: 0,
  dutyRatePct: 0,
  vatRatePct: 23,
  vatOnDuty: true,
  customsBrokerFee: 0,
  handlingFee: 0,
});

export function LandedCostCalculatorPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { ...EMPTY_SCENARIO('Chiny (FOB Shanghai)'), dutyRatePct: 6.5 },
    { ...EMPTY_SCENARIO('Nearshore (EU)'), dutyRatePct: 0 },
  ]);

  const breakdowns = useMemo(
    () =>
      scenarios.map((s) => {
        try {
          return computeLandedCost(s);
        } catch {
          return null;
        }
      }),
    [scenarios],
  );

  const comparison = useMemo(() => {
    const a = breakdowns[0];
    const b = breakdowns[1];
    if (!a || !b) return null;
    return compareLandedCost(a, b);
  }, [breakdowns]);

  const updateScenario = (idx: number, field: keyof Scenario, value: any) => {
    setScenarios((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const applyDutyPreset = (idx: number, presetLabel: string) => {
    const preset = DUTY_PRESETS.find((p) => p.label === presetLabel);
    if (preset) updateScenario(idx, 'dutyRatePct', preset.ratePct);
  };

  const applyVatCountry = (idx: number, country: string) => {
    const rate = DEFAULT_VAT_RATES[country];
    if (rate !== undefined) updateScenario(idx, 'vatRatePct', rate);
  };

  const copyBreakdown = (idx: number) => {
    const b = breakdowns[idx];
    if (!b) return;
    const lines = [
      `Scenariusz: ${scenarios[idx].label}`,
      `FOB total: ${b.fobTotal} ${scenarios[idx].currency}`,
      `Freight: ${b.freightTotal}`,
      `Insurance: ${b.insuranceTotal}`,
      `CIF: ${b.cifTotal}`,
      `Duty (${scenarios[idx].dutyRatePct}%): ${b.dutyTotal}`,
      `VAT (${scenarios[idx].vatRatePct}%): ${b.vatTotal}`,
      `Broker + handling + inland: ${b.customsBrokerFee + b.handlingFee + b.inlandTransportTotal}`,
      `Landed total: ${b.landedCostTotal}`,
      `Landed per unit: ${b.landedCostPerUnit}`,
      `Markup vs FOB: +${b.markupVsFob}%`,
    ].join('\n');
    navigator.clipboard.writeText(lines);
    toast.success('Breakdown skopiowane do schowka');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Landed Cost Calculator</h1>
        </div>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Porównaj rzeczywisty koszt importu z różnych regionów. Kalkulator sumuje
          FOB + freight + ubezpieczenie + cło + VAT + opłaty brokerskie, żeby
          pokazać landed cost per jednostkę. Użyj go do oceny, czy nearshoring
          faktycznie jest tańszy niż import z Chin.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {scenarios.map((scenario, idx) => (
          <ScenarioCard
            key={idx}
            idx={idx}
            scenario={scenario}
            breakdown={breakdowns[idx]}
            onChange={(field, value) => updateScenario(idx, field, value)}
            onDutyPreset={(label) => applyDutyPreset(idx, label)}
            onVatCountry={(country) => applyVatCountry(idx, country)}
            onCopy={() => copyBreakdown(idx)}
          />
        ))}
      </div>

      {comparison && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {comparison.cheaperScenario === 'tie' ? (
                <Info className="h-4 w-4 text-muted-foreground" />
              ) : comparison.cheaperScenario === 'b' ? (
                <TrendingDown className="h-4 w-4 text-emerald-600" />
              ) : (
                <TrendingUp className="h-4 w-4 text-rose-600" />
              )}
              Porównanie
            </CardTitle>
          </CardHeader>
          <CardContent>
            {comparison.cheaperScenario === 'tie' ? (
              <p className="text-sm">Oba scenariusze dają taki sam landed cost per unit.</p>
            ) : (
              <div className="space-y-2 text-sm">
                <p>
                  <strong>
                    {comparison.cheaperScenario === 'b'
                      ? scenarios[1].label
                      : scenarios[0].label}
                  </strong>{' '}
                  jest tańszy o{' '}
                  <strong
                    className={
                      comparison.cheaperScenario === 'b'
                        ? 'text-emerald-700'
                        : 'text-rose-700'
                    }
                  >
                    {Math.abs(comparison.perUnitDelta).toFixed(2)} {scenarios[0].currency}/unit
                    {' '}
                    ({Math.abs(comparison.perUnitDeltaPct).toFixed(1)}%)
                  </strong>
                  .
                </p>
                <p className="text-muted-foreground">
                  Różnica na całej dostawie (qty={scenarios[comparison.cheaperScenario === 'b' ? 1 : 0].quantity}):{' '}
                  <strong>
                    {Math.abs(comparison.totalDelta).toFixed(2)} {scenarios[0].currency}
                  </strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mt-6 border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <Info className="h-4 w-4" />
            Jak używać
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1.5">
          <p>• <strong>FOB</strong> = cena jednostkowa po stronie dostawcy, przed frachtem i cłami.</p>
          <p>• <strong>CIF</strong> = FOB + freight + insurance (baza do naliczenia cła).</p>
          <p>• Dla UE VAT standardowo liczy się od CIF + duty (zaznaczone jako "VAT on duty"). W USA sales tax zwykle nie dotyczy importu.</p>
          <p>• Stawka cła zależy od 10-cyfrowego HS/CN code — presety to przybliżenia. Zweryfikuj finalne stawki z TARIC.</p>
          <p>• Broker fee + handling to typowo 50–300 EUR per shipment. Inland transport — od portu docelowego do magazynu.</p>
        </CardContent>
      </Card>
    </div>
  );
}

interface ScenarioCardProps {
  idx: number;
  scenario: Scenario;
  breakdown: ReturnType<typeof computeLandedCost> | null;
  onChange: (field: keyof Scenario, value: any) => void;
  onDutyPreset: (label: string) => void;
  onVatCountry: (country: string) => void;
  onCopy: () => void;
}

function ScenarioCard({
  scenario,
  breakdown,
  onChange,
  onDutyPreset,
  onVatCountry,
  onCopy,
}: ScenarioCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <Input
            value={scenario.label}
            onChange={(e) => onChange('label', e.target.value)}
            className="text-base font-semibold h-8"
          />
          <Button size="sm" variant="ghost" onClick={onCopy} title="Kopiuj breakdown">
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Field label="FOB/unit" value={scenario.fobUnitPrice} onChange={(v) => onChange('fobUnitPrice', v)} />
          <Field label="Ilość" value={scenario.quantity} onChange={(v) => onChange('quantity', v)} />
        </div>

        <div>
          <Label className="text-[11px] text-muted-foreground">Waluta</Label>
          <Input
            value={scenario.currency}
            onChange={(e) => onChange('currency', e.target.value.toUpperCase())}
            maxLength={3}
            className="mt-0.5 h-8 uppercase"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Freight (total)" value={scenario.freightTotal} onChange={(v) => onChange('freightTotal', v)} />
          <Field label="Insurance (total)" value={scenario.insuranceTotal ?? 0} onChange={(v) => onChange('insuranceTotal', v)} />
        </div>

        <div>
          <Label className="text-[11px] text-muted-foreground">Duty preset</Label>
          <select
            onChange={(e) => onDutyPreset(e.target.value)}
            className="w-full mt-0.5 h-8 rounded-md border border-input bg-background px-2 text-xs"
            defaultValue=""
          >
            <option value="" disabled>
              Wybierz stawkę...
            </option>
            {DUTY_PRESETS.map((p) => (
              <option key={p.label} value={p.label}>
                {p.label} ({p.ratePct}%)
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field
            label="Duty rate %"
            value={scenario.dutyRatePct}
            onChange={(v) => onChange('dutyRatePct', v)}
            step="0.1"
          />
          <div>
            <Label className="text-[11px] text-muted-foreground">VAT (kraj)</Label>
            <div className="flex gap-1 mt-0.5">
              <select
                onChange={(e) => onVatCountry(e.target.value)}
                className="h-8 w-16 rounded-md border border-input bg-background px-1 text-xs"
                defaultValue=""
              >
                <option value="" disabled>
                  —
                </option>
                {Object.keys(DEFAULT_VAT_RATES).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                value={scenario.vatRatePct}
                onChange={(e) => onChange('vatRatePct', Number(e.target.value) || 0)}
                step="0.1"
                className="h-8 flex-1"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Field label="Broker fee" value={scenario.customsBrokerFee ?? 0} onChange={(v) => onChange('customsBrokerFee', v)} />
          <Field label="Handling" value={scenario.handlingFee ?? 0} onChange={(v) => onChange('handlingFee', v)} />
          <Field label="Inland transp." value={scenario.inlandTransportTotal ?? 0} onChange={(v) => onChange('inlandTransportTotal', v)} />
        </div>

        {/* Breakdown */}
        {breakdown && (
          <div className="mt-4 pt-3 border-t border-slate-200 space-y-1 text-xs">
            <Row label="FOB total" value={breakdown.fobTotal} currency={scenario.currency} />
            <Row label="+ Freight" value={breakdown.freightTotal} currency={scenario.currency} muted />
            <Row label="+ Insurance" value={breakdown.insuranceTotal} currency={scenario.currency} muted />
            <Row label="= CIF" value={breakdown.cifTotal} currency={scenario.currency} bold />
            <Row
              label={`+ Duty (${scenario.dutyRatePct}%)`}
              value={breakdown.dutyTotal}
              currency={scenario.currency}
              muted
            />
            <Row
              label={`+ VAT (${scenario.vatRatePct}%)`}
              value={breakdown.vatTotal}
              currency={scenario.currency}
              muted
            />
            <Row
              label="+ Broker + handling + inland"
              value={
                breakdown.customsBrokerFee +
                breakdown.handlingFee +
                breakdown.inlandTransportTotal
              }
              currency={scenario.currency}
              muted
            />
            <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
              <span className="font-semibold">Landed total</span>
              <span className="font-bold tabular-nums">
                {breakdown.landedCostTotal.toFixed(2)} {scenario.currency}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-semibold text-primary">Landed / unit</span>
              <span className="font-bold tabular-nums text-primary">
                {breakdown.landedCostPerUnit.toFixed(2)} {scenario.currency}
              </span>
            </div>
            <div className="flex items-baseline justify-between text-[11px] text-muted-foreground">
              <span>Markup vs FOB</span>
              <span>+{breakdown.markupVsFob}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
}) {
  return (
    <div>
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        step={step || '0.01'}
        className="mt-0.5 h-8 tabular-nums"
      />
    </div>
  );
}

export default LandedCostCalculatorPage;

function Row({
  label,
  value,
  currency,
  muted,
  bold,
}: {
  label: string;
  value: number;
  currency: string;
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between ${
        muted ? 'text-muted-foreground' : ''
      }`}
    >
      <span className={bold ? 'font-medium' : ''}>{label}</span>
      <span className={`tabular-nums ${bold ? 'font-semibold' : ''}`}>
        {value.toFixed(2)} {currency}
      </span>
    </div>
  );
}
