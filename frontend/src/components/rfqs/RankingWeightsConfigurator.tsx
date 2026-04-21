import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, Save } from 'lucide-react';
import type { RankingWeights } from '@/services/rfqs.service';
import { DEFAULT_RANKING_WEIGHTS } from '@/services/rfqs.service';

interface RankingWeightsConfiguratorProps {
  initialWeights?: RankingWeights;
  onApply: (weights: RankingWeights, persist: boolean) => void;
  onCancel?: () => void;
  showPersistOption?: boolean;
  isSaving?: boolean;
}

type CriterionKey = keyof RankingWeights;

const CRITERIA: Array<{
  key: CriterionKey;
  label: string;
  hint: string;
  tone: string;
}> = [
  {
    key: 'price',
    label: 'Cena',
    hint: 'Niższa cena (po przeliczeniu na walutę bazową) = wyższy wynik',
    tone: 'bg-emerald-500',
  },
  {
    key: 'leadTime',
    label: 'Czas dostawy',
    hint: 'Krótszy lead time = wyższy wynik',
    tone: 'bg-sky-500',
  },
  {
    key: 'moq',
    label: 'MOQ',
    hint: 'Niższe MOQ = wyższy wynik (większa elastyczność)',
    tone: 'bg-amber-500',
  },
  {
    key: 'quality',
    label: 'Jakość dostawcy',
    hint: 'Historia: response rate, speed, completeness, win rate',
    tone: 'bg-violet-500',
  },
  {
    key: 'compliance',
    label: 'Zgodność',
    hint: 'Potwierdzone specyfikacje + Incoterms w ofercie',
    tone: 'bg-rose-500',
  },
];

export function RankingWeightsConfigurator({
  initialWeights,
  onApply,
  onCancel,
  showPersistOption = true,
  isSaving = false,
}: RankingWeightsConfiguratorProps) {
  const [weights, setWeights] = useState<RankingWeights>(
    initialWeights ?? DEFAULT_RANKING_WEIGHTS,
  );

  useEffect(() => {
    if (initialWeights) setWeights(initialWeights);
  }, [initialWeights]);

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const totalPct = Math.round(total * 100);
  const isValid = Math.abs(total - 1) < 0.01;

  const handleChange = (key: CriterionKey, valuePct: number) => {
    setWeights((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.min(1, valuePct / 100)),
    }));
  };

  const resetToDefaults = () => setWeights(DEFAULT_RANKING_WEIGHTS);

  const normalizeToSumOne = () => {
    if (total === 0) {
      setWeights(DEFAULT_RANKING_WEIGHTS);
      return;
    }
    const factor = 1 / total;
    setWeights({
      price: weights.price * factor,
      leadTime: weights.leadTime * factor,
      moq: weights.moq * factor,
      quality: weights.quality * factor,
      compliance: weights.compliance * factor,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">Wagi rankingu ofert</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Ustaw jak ważne jest każde kryterium. Suma musi wynosić 100%.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToDefaults}
            className="h-8 px-2 text-xs"
            type="button"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {CRITERIA.map((c) => {
          const pct = Math.round(weights[c.key] * 100);
          return (
            <div key={c.key}>
              <div className="flex items-baseline justify-between mb-1.5">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span className={`inline-block h-2 w-2 rounded-full ${c.tone}`} />
                  {c.label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={pct}
                    onChange={(e) =>
                      handleChange(c.key, Number(e.target.value) || 0)
                    }
                    min={0}
                    max={100}
                    step={5}
                    className="w-14 h-7 px-2 text-xs border rounded text-right tabular-nums"
                  />
                  <span className="text-xs text-muted-foreground w-4">%</span>
                </div>
              </div>
              <input
                type="range"
                value={pct}
                onChange={(e) => handleChange(c.key, Number(e.target.value))}
                min={0}
                max={100}
                step={5}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <p className="text-[11px] text-muted-foreground mt-1">{c.hint}</p>
            </div>
          );
        })}

        {/* Sum feedback */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Suma wag</span>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-bold tabular-nums ${
                  isValid ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {totalPct}%
              </span>
              {!isValid && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={normalizeToSumOne}
                  className="h-7 px-2 text-xs"
                  type="button"
                >
                  Normalizuj
                </Button>
              )}
            </div>
          </div>
          {!isValid && (
            <p className="text-[11px] text-rose-600 mt-1">
              Kliknij „Normalizuj" aby proporcjonalnie przeskalować do 100%.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              type="button"
            >
              Anuluj
            </Button>
          )}
          {showPersistOption && (
            <Button
              variant="outline"
              onClick={() => onApply(weights, true)}
              disabled={!isValid || isSaving}
              className="flex-1"
              type="button"
            >
              <Save className="h-4 w-4 mr-1.5" />
              Zapisz na RFQ
            </Button>
          )}
          <Button
            onClick={() => onApply(weights, false)}
            disabled={!isValid || isSaving}
            className="flex-1"
            type="button"
          >
            Porównaj
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
