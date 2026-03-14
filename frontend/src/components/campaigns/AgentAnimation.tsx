import { useEffect, useState, useRef } from 'react';
import { Brain, Search, BarChart3, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AgentAnimationProps {
  currentStage: string;
  progress: Record<string, number>;
  suppliersFound: number;
}

const FLOW_AREAS = [
  {
    id: 'strategy',
    label: 'Strategia',
    description: 'Generowanie zapytań wyszukiwania',
    icon: Brain,
    gradient: 'from-[#5E8C8F] to-[#2A5C5D]',
    glowColor: 'rgba(94, 140, 143, 0.3)',
    duration: 4000,
  },
  {
    id: 'scanning',
    label: 'Skanowanie',
    description: 'Przeszukiwanie internetu',
    icon: Search,
    gradient: 'from-amber-500 to-orange-500',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    duration: 8000,
  },
  {
    id: 'analysis',
    label: 'Analiza',
    description: 'Ocena dostawców',
    icon: BarChart3,
    gradient: 'from-[#8E8396] to-[#6B5E7A]',
    glowColor: 'rgba(142, 131, 150, 0.3)',
    duration: 6000,
  },
  {
    id: 'enrichment',
    label: 'Wzbogacanie',
    description: 'Dane kontaktowe',
    icon: Sparkles,
    gradient: 'from-emerald-500 to-green-600',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    duration: 5000,
  },
];

export function AgentAnimation({
  currentStage,
  suppliersFound,
}: AgentAnimationProps) {
  const isCompleted = currentStage === 'COMPLETED';
  const [activeArea, setActiveArea] = useState(0);
  const [dots, setDots] = useState<Array<{ id: number; areaIdx: number; progress: number }>>([]);
  const dotIdRef = useRef(0);

  // Cycle through areas independently of API
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setActiveArea((prev) => (prev + 1) % FLOW_AREAS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isCompleted]);

  // Spawn animated data dots
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      const id = dotIdRef.current++;
      const areaIdx = Math.floor(Math.random() * FLOW_AREAS.length);
      setDots((prev) => [...prev.slice(-12), { id, areaIdx, progress: 0 }]);
    }, 600);
    return () => clearInterval(interval);
  }, [isCompleted]);

  // Animate dots
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setDots((prev) =>
        prev
          .map((d) => ({ ...d, progress: d.progress + 8 }))
          .filter((d) => d.progress <= 100)
      );
    }, 50);
    return () => clearInterval(interval);
  }, [isCompleted]);

  if (isCompleted) {
    return (
      <Card className="overflow-hidden border-green-200">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" style={{ animationDuration: '2s' }} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-green-700">Dane zostały zebrane</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Znaleziono <span className="font-bold text-foreground">{suppliersFound}</span> dostawców
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 sm:p-8">
        {/* Flow areas grid */}
        <div className="grid grid-cols-2 gap-3">
          {FLOW_AREAS.map((area, idx) => {
            const Icon = area.icon;
            const isActive = idx === activeArea;
            const areaDots = dots.filter((d) => d.areaIdx === idx);

            return (
              <div
                key={area.id}
                className="relative rounded-xl border p-4 transition-all duration-500 overflow-hidden"
                style={{
                  borderColor: isActive ? area.glowColor : 'var(--border)',
                  boxShadow: isActive ? `0 0 20px ${area.glowColor}` : 'none',
                }}
              >
                {/* Data flow particles */}
                {areaDots.map((dot) => (
                  <div
                    key={dot.id}
                    className="absolute rounded-full opacity-60"
                    style={{
                      width: 4,
                      height: 4,
                      background: `linear-gradient(135deg, ${area.glowColor}, transparent)`,
                      left: `${10 + dot.progress * 0.8}%`,
                      top: `${30 + Math.sin(dot.id) * 20}%`,
                      opacity: 1 - dot.progress / 100,
                      transition: 'left 50ms linear, opacity 50ms linear',
                    }}
                  />
                ))}

                <div className="flex items-center gap-3 relative z-10">
                  <div
                    className={`h-10 w-10 rounded-lg bg-gradient-to-br ${area.gradient} flex items-center justify-center shrink-0 transition-transform duration-500`}
                    style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)' }}
                  >
                    {isActive ? (
                      <Loader2 className="h-5 w-5 text-white animate-spin" style={{ animationDuration: '1.5s' }} />
                    ) : (
                      <Icon className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold truncate">{area.label}</h4>
                    <p className="text-xs text-muted-foreground truncate">{area.description}</p>
                  </div>
                </div>

                {/* Activity bar */}
                <div className="mt-3 h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${area.gradient} transition-all duration-500`}
                    style={{
                      width: isActive ? '100%' : `${30 + (areaIdx * 10)}%`,
                      opacity: isActive ? 1 : 0.4,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Status line */}
        <div className="mt-6 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Zbieranie danych w toku
            </span>
          </div>
          <span className="text-2xl font-bold text-primary tabular-nums">
            {suppliersFound}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default AgentAnimation;
