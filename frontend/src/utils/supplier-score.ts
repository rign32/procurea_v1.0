/**
 * Canonical conversion from the backend's 0-10 Supplier.analysisScore scale
 * to the 0-100 percent the UI renders. Centralised so Cards, Detail page,
 * Scorecard, and Registry stay in lockstep when the formula evolves.
 */
export function scoreToPercent(analysisScore: number | null | undefined): number {
  if (analysisScore == null || Number.isNaN(analysisScore)) return 0;
  return Math.max(0, Math.min(100, Math.round(analysisScore * 10)));
}

/** Display as "72%" or "—" when no score is available. */
export function formatScorePercent(analysisScore: number | null | undefined): string {
  if (analysisScore == null || Number.isNaN(analysisScore)) return '—';
  return `${scoreToPercent(analysisScore)}%`;
}

/** Tone bucket for badge / progress-bar coloring. */
export function scoreTone(percent: number): 'good' | 'warn' | 'bad' {
  if (percent >= 80) return 'good';
  if (percent >= 60) return 'warn';
  return 'bad';
}
