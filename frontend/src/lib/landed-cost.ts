/**
 * Landed cost calculator — pure function, no side-effects.
 *
 * Computes the total landed cost per unit by summing:
 *  - FOB (Free On Board) unit price
 *  - Freight (shipping to destination port/warehouse)
 *  - Insurance (optional, % of CIF or flat)
 *  - Customs duty (% applied on CIF value)
 *  - VAT (% applied on CIF + duty + handling)
 *  - Handling / customs broker fees (flat or %)
 *  - Inland transport (optional)
 *
 * Input can be provided at the shipment level (total cost per column) or
 * at the unit level (scaled by quantity). Output returns a breakdown with
 * per-unit values ready for display.
 *
 * Incoterm assumption: we model FOB as "FOB port of origin" — the seller
 * covers export clearance; buyer pays ocean freight, insurance, import
 * duty/VAT, and inland transport at destination. Other common Incoterms
 * (CIF, DDP, EXW) can be approximated by zeroing or pre-filling fields.
 */

export interface LandedCostInput {
  // Product pricing
  fobUnitPrice: number; // base unit cost at origin
  quantity: number; // number of units in shipment
  currency: string; // ISO-4217 currency code (display only — all math in same currency)

  // Shipping costs (in shipment currency, totals unless noted)
  freightTotal: number; // ocean/air freight cost for the whole shipment
  insuranceTotal?: number; // cargo insurance (often 0.1-0.3% of CIF)
  inlandTransportTotal?: number; // from destination port to warehouse

  // Import duties & taxes (percent of CIF unless noted)
  dutyRatePct: number; // e.g. 6.5 for "6.5%"
  vatRatePct: number; // destination country VAT, e.g. 23 for PL, 19 for DE
  vatOnDuty?: boolean; // true if VAT applies to CIF + duty (EU default), false for CIF-only

  // Fixed fees
  customsBrokerFee?: number; // flat fee per shipment
  handlingFee?: number; // flat fee per shipment
}

export interface LandedCostBreakdown {
  fobTotal: number;
  freightTotal: number;
  insuranceTotal: number;
  cifTotal: number; // FOB + freight + insurance
  dutyTotal: number; // CIF * dutyRate
  dutiableValue: number; // CIF + (duty if VAT on duty)
  vatTotal: number;
  customsBrokerFee: number;
  handlingFee: number;
  inlandTransportTotal: number;
  landedCostTotal: number;
  landedCostPerUnit: number;
  markupVsFob: number; // % markup over FOB (how much import overhead adds)
}

/**
 * Compute landed cost with full breakdown. All monetary values returned in
 * the same currency as input (caller is responsible for FX conversion).
 */
export function computeLandedCost(input: LandedCostInput): LandedCostBreakdown {
  const {
    fobUnitPrice,
    quantity,
    freightTotal,
    insuranceTotal = 0,
    inlandTransportTotal = 0,
    dutyRatePct,
    vatRatePct,
    vatOnDuty = true, // EU default
    customsBrokerFee = 0,
    handlingFee = 0,
  } = input;

  if (fobUnitPrice < 0 || quantity <= 0) {
    throw new Error('fobUnitPrice must be ≥ 0 and quantity must be > 0');
  }

  const fobTotal = round(fobUnitPrice * quantity);
  const cifTotal = round(fobTotal + freightTotal + insuranceTotal);

  const dutyTotal = round(cifTotal * (dutyRatePct / 100));
  const dutiableValue = vatOnDuty ? cifTotal + dutyTotal : cifTotal;
  const vatTotal = round(dutiableValue * (vatRatePct / 100));

  const landedCostTotal = round(
    cifTotal +
      dutyTotal +
      vatTotal +
      customsBrokerFee +
      handlingFee +
      inlandTransportTotal,
  );

  const landedCostPerUnit = round(landedCostTotal / quantity);
  const markupVsFob = fobUnitPrice > 0
    ? round(((landedCostPerUnit - fobUnitPrice) / fobUnitPrice) * 100)
    : 0;

  return {
    fobTotal,
    freightTotal: round(freightTotal),
    insuranceTotal: round(insuranceTotal),
    cifTotal,
    dutyTotal,
    dutiableValue: round(dutiableValue),
    vatTotal,
    customsBrokerFee: round(customsBrokerFee),
    handlingFee: round(handlingFee),
    inlandTransportTotal: round(inlandTransportTotal),
    landedCostTotal,
    landedCostPerUnit,
    markupVsFob,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Compare two landed-cost scenarios (e.g. China FOB vs nearshore EXW).
 * Returns deltas on key fields — useful for "is nearshoring cheaper?" analysis.
 */
export interface LandedCostComparison {
  a: LandedCostBreakdown;
  b: LandedCostBreakdown;
  perUnitDelta: number; // b - a (positive means b is more expensive)
  perUnitDeltaPct: number;
  totalDelta: number;
  cheaperScenario: 'a' | 'b' | 'tie';
}

export function compareLandedCost(
  a: LandedCostBreakdown,
  b: LandedCostBreakdown,
): LandedCostComparison {
  const perUnitDelta = round(b.landedCostPerUnit - a.landedCostPerUnit);
  const perUnitDeltaPct = a.landedCostPerUnit > 0
    ? round((perUnitDelta / a.landedCostPerUnit) * 100)
    : 0;
  const totalDelta = round(b.landedCostTotal - a.landedCostTotal);
  const cheaperScenario: 'a' | 'b' | 'tie' =
    perUnitDelta === 0 ? 'tie' : perUnitDelta > 0 ? 'a' : 'b';
  return { a, b, perUnitDelta, perUnitDeltaPct, totalDelta, cheaperScenario };
}

/**
 * Common VAT rates (destination country). User can override.
 */
export const DEFAULT_VAT_RATES: Record<string, number> = {
  PL: 23,
  DE: 19,
  FR: 20,
  IT: 22,
  ES: 21,
  NL: 21,
  CZ: 21,
  SK: 20,
  AT: 20,
  BE: 21,
  DK: 25,
  FI: 24,
  PT: 23,
  SE: 25,
  RO: 19,
  HU: 27,
  GB: 20,
  IE: 23,
  US: 0, // state sales tax varies — not applicable at import level
};

/**
 * Rough duty-rate presets for common origin→EU product categories.
 * Real duties depend on 10-digit HS/CN codes. These are ballpark defaults;
 * the user should override with the exact rate from TARIC/customs data.
 */
export const DUTY_PRESETS: Array<{
  label: string;
  origin: string;
  category: string;
  ratePct: number;
}> = [
  { label: 'China → EU · Textiles', origin: 'CN', category: 'textiles', ratePct: 12 },
  { label: 'China → EU · Electronics', origin: 'CN', category: 'electronics', ratePct: 4 },
  { label: 'China → EU · Plastics', origin: 'CN', category: 'plastics', ratePct: 6.5 },
  { label: 'China → EU · Steel/metal', origin: 'CN', category: 'metal', ratePct: 2 },
  { label: 'China → EU · Furniture', origin: 'CN', category: 'furniture', ratePct: 2.7 },
  { label: 'Turkey → EU · Textiles (preferential)', origin: 'TR', category: 'textiles', ratePct: 0 },
  { label: 'Turkey → EU · Industrial goods', origin: 'TR', category: 'industrial', ratePct: 0 },
  { label: 'UK → EU · Post-Brexit (TCA)', origin: 'GB', category: 'generic', ratePct: 0 },
  { label: 'Intra-EU (no duty)', origin: 'EU', category: 'any', ratePct: 0 },
  { label: 'USA → EU · MFN generic', origin: 'US', category: 'generic', ratePct: 3 },
];
