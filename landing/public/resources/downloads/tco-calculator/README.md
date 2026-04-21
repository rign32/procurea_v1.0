# TCO Calculator — Beat the Lowest-Price Trap

A pragmatic Excel calculator that reveals the real Total Cost of Ownership behind supplier offers. Goes beyond unit price to include ten cost categories Finance usually pretends don't exist until the first quarter report. Based on ~200 real sourcing decisions across the Procurea beta cohort.

## What's in this bundle

- `tco-calculator.xlsx` — ready-to-use workbook (three tabs: Categories, Comparison, Sensitivity)
- `tco-calculator-tab1-categories.csv` — the ten cost categories with definitions, default calculation basis, an example value (so the sheet isn't blank), and usage notes
- `tco-calculator-tab2-comparison.csv` — five-supplier comparison using realistic numbers: China, Turkey, Poland, Portugal, Romania for a hypothetical machined-metal part at 50,000 units/year
- `tco-calculator-tab3-sensitivity.csv` — sensitivity analysis: what happens to the winner when FX moves, lead times blow out, or tariffs shift
- `README.md` — this file (setup + defaults)
- `tco-calculator-guide.md` — **practitioner's guide**: 5 industry profiles (electronics, metals, apparel, medical, packaging), sensitivity walkthrough with worked China-vs-Poland example, 8 Excel formulas to rebuild the XLSX, decision rules when the winner flips, 6 common mistakes

## Start here

If you're setting up the workbook: read this README, then see `tco-calculator-guide.md` section 3 for formulas.

If you have the XLSX open and want to adapt it to your category: go straight to `tco-calculator-guide.md` section 1 (industry profiles) — pick the one closest to yours, paste the parameter overrides, move on.

If your baseline winner looks fragile under sensitivity: `tco-calculator-guide.md` section 4 (decision rules when the winner flips).

If something in your analysis feels off: `tco-calculator-guide.md` section 5 (6 common mistakes).

## How to convert to XLSX

1. Open each CSV in Excel. Save all three as tabs of a single workbook `tco-calculator.xlsx`:
   - Tab 1 rename to `Categories`
   - Tab 2 rename to `Comparison`
   - Tab 3 rename to `Sensitivity`
2. Add a README tab (optional) with contact info and the assumption table below.
3. Wire the Comparison tab formulas (see next section).
4. Add a bar chart on Comparison summarising Total TCO per supplier (Insert → Chart → Bar).
5. Save. No macros needed.

## Formulas for the Comparison tab (tab 2)

The CSV ships with values. To make it dynamic, replace the values with formulas that reference the Categories tab defaults where useful:

**Freight In per unit** (row 3): estimate from total shipping quote / units ordered. Alternatively use category defaults — e.g. €0.75 for sea from China, €0.28 for road from Turkey, €0.12 for road from Poland (EU domestic).

**Import Duties per unit** (row 4): `= HTS_rate × Unit_Price`. For EU origin = 0. For China origin to EU on machined metal = typically 0-6% depending on HTS code. Ask your customs broker.

**CBAM Adjustment** (row 5): `= Embedded_CO2_kg × CBAM_price_per_kg`. For Chinese steel ~2.0 kg CO2/kg steel × €0.03/kg = €0.06/kg of product. For Turkish steel ~1.4 kg CO2/kg (newer mills) × €0.03 = €0.04/kg. Set to 0 for EU origin.

**Inventory Carrying Cost** (row 6): `= Unit_Price × Carrying_Rate × (Lead_Time_Days / 365)`. Carrying rate default 20% (cost of capital 8% + storage 5% + insurance 2% + obsolescence 5%). For a €10 unit at 56 days lead time: 10 × 0.20 × (56/365) = €0.31.

**Defect / Rework Cost** (row 7): `= (PPM / 1000000) × Rework_Multiplier × Unit_Price`. Default rework multiplier = 3. For 500 PPM × 3 × €10 = €0.015 per unit. Increase multiplier to 10 for scrap, 30 for field-failure recalls.

**Payment Terms Cost** (row 8): `= ((Target_Terms_Days - Actual_Terms_Days) / 365) × Unit_Price × Cost_of_Capital`. If you want Net 60 and supplier gives Net 30: (60-30)/365 × 10 × 0.08 = €0.066.

**Switching Cost Amortization** (row 9): `= (Tooling_Cost + Audit_Cost + Qualification_Hours × Hourly_Rate) / First_Year_Units`. For €15k tooling + €5k audit + 60 hours × €100 loaded = €26,000 / 50,000 units = €0.52. If tooling is already amortised (existing supplier), set to 0.

**Risk Premium (Single-Source)** (row 10): subjective, 0-5% of unit price. Use 0% for commodity with many sources, 3% for strategic custom, 5% for sole-source non-substitutable.

**Currency Hedging Cost** (row 11): 0.5-1.5% of unit price for non-EUR quotes. Set to 0 for EUR quotes.

**Total TCO per Unit** (row 12): `= SUM(Unit_Price : Currency_Hedging)`.

**Delta vs Unit Price (%)** (row 13): `= (Total_TCO - Unit_Price) / Unit_Price`.

**Rank** (row 17): `= RANK(Total_TCO_for_this_supplier, $Total_TCO_all_suppliers$, 1)`. Ascending, 1 = lowest TCO = best.

## Default assumptions (adjust to your company)

| Assumption | Default | Where to change |
|---|---|---|
| Cost of capital (WACC) | 8.0% | Ask your Treasury or CFO. Common range 6-12%. |
| Inventory carrying rate | 20.0% | Industry-specific: electronics 25%, commodity metals 15%. |
| Defect rework multiplier | 3× | Conservative. Medical devices use 10-30×. |
| FX buffer on volatile currencies | 3-5% | TRY, ARS, ZAR need 5-10%. EUR, USD, CHF need 0-2%. |
| Single-source risk premium | 3% (default) | Zero for commodity, 5%+ for strategic. |

## How to use the sensitivity tab (tab 3)

The sensitivity analysis is the most important tab and the one buyers skip. It answers: "under what conditions does my winner stop being the winner?"

Run these five scenarios at minimum:

1. **FX stress** — test +5% and +10% against the supplier's quote currency
2. **Lead time stress** — test +14 days (the Red Sea reality) for Asia-origin suppliers
3. **Tariff stress** — test +15% on China-origin for US buyers (Section 301 expansion risk)
4. **CBAM escalation** — test €75/tonne on covered categories
5. **Compound stress** — combine two of the above (real crises come in pairs)

If your winner survives all five, you have a robust choice. If it changes in two or more, you have a fragile choice — and the "second best" supplier on baseline pricing is often the more defensible recommendation to the CFO.

## Reading the sample data

The pre-filled comparison uses a realistic scenario: 50,000 units/year of a machined metal part at unit prices €8.95-€12.40 across five supplier countries.

The headline: **Supplier A (China) wins on unit price by 28%, wins on TCO by only 2%.** Under any 2026 stressor (Red Sea, CBAM, USD strength), Supplier A loses the TCO race to Supplier B (Turkey) or Supplier C (Poland).

This is the TCO-vs-price gap that makes the difference between a savings win and a savings illusion.

## Limitations

This calculator is for **goods**, not services. Service TCO has different structure (people cost, knowledge transfer, dependency on individuals) and needs a different model.

It assumes **steady-state** demand. For seasonal or launch categories, add a launch-cost line item.

It does not replace a **supplier risk assessment**. Run the 20-point Supplier Risk Checklist in parallel — a supplier with the lowest TCO but a 60% customer-concentration risk or a missed sanctions screen is not a winner regardless of the number.

## Quick reference: category calibration

The shipped XLSX defaults (20% carrying rate, 3× rework multiplier, 3% risk premium) are calibrated for **machined metal parts, EU buyer, 50k units/year**. If you're in a different category, these are the first-pass overrides. Full profiles with gotchas in `tco-calculator-guide.md` section 1.

| Category | Carrying rate | Rework mult. | CBAM relevance | First-pass gotcha |
|---|---|---|---|---|
| Electronics / CM | 15% | 5× | Negligible (chassis only) | Model BOM volatility reserve 3-5% separate from FX |
| Metals / machined | 20% | 3-10× | 30-80 EUR/tonne | Check if raw material 3.1 cert traceability priced in |
| Apparel / textiles | 28% | 2× | None, CSRD relevant | Late delivery = markdown cascade, not a % late |
| Medical devices | 22% | 10-30× | Part-dependent | Supplier change triggers regulatory notification — price it |
| Packaging / consumables | 15% | 1.5× | Paper/alu from non-EU | MOQ over-buy + SKU churn dominates unit price |

## How Procurea fits (light touch)

This calculator is standalone and free. If you're running multi-country RFQs regularly — e.g. China vs. multiple nearshore alternatives — the Procurea platform finds and verifies the 100-250 suppliers you want to actually compare in the first place, with multilingual outreach in 26 languages. The comparison step still wants a TCO model and a human — that's why this calculator exists.

See procurea.io/features/offer-comparison if you want to see sourcing + comparison integrated. Otherwise this Excel does the job.

Published by Procurea, April 2026. Revised quarterly as assumptions (CBAM, WACC, carrying rates) evolve.
