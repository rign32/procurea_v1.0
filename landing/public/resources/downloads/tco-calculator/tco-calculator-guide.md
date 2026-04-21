---
title: "TCO Calculator — Practitioner's Guide"
subtitle: "Industry profiles, sensitivity reading, rebuild instructions, and mistakes to avoid"
author: "Procurea"
date: "April 2026"
version: "1.0"
---

\newpage

# TCO Calculator — Practitioner's Guide

The base XLSX ships with ten cost categories and a five-supplier example (machined metal part). Defaults are deliberately generic: 8% cost of capital, 20% carrying rate, 3× rework multiplier, 3% single-source risk premium. Those defaults fit roughly nobody exactly.

This guide covers the five things the README doesn't:

1. Industry-specific default overrides (5 profiles you paste straight in)
2. How to read the sensitivity tab — with a worked walkthrough
3. How to rebuild the XLSX in 15 minutes from the CSVs — formulas included
4. What to do when the sensitivity test flips the winner
5. Common TCO mistakes — the six errors that wreck the comparison

No introductions. Defaults and deltas only.

---

\newpage

# 1. Industry-specific assumption profiles

Defaults in the shipped calculator are tuned for a **machined metal part, 50k units/year, EU buyer**. If you're in a different category, paste one of these five profiles into the Categories tab (or overwrite the assumption cells on the Comparison tab directly).

Each profile lists the parameter, the number to use instead of the default, a one-line reason, and one gotcha that TCO models commonly miss for that category.

---

## 1.1 Electronics / contract manufacturing

**Context:** PCBA, cable assemblies, enclosures, box-build. Typically Chinese or Southeast Asian ODM/CM relationships with US or EU buyers. High mix, moderate volume, rapid obsolescence.

| Parameter | Default | Electronics override | Reason |
|---|---|---|---|
| Cost of capital (WACC) | 8.0% | 10-12% | Tech-sector WACC runs higher; ask Treasury |
| Inventory carrying rate | 20.0% | **15%** | Faster inventory turn than general goods; lower warehousing cost per EUR of value; BUT offset by obsolescence risk (see below) |
| Defect rework multiplier | 3× | **5×** | Field failures on electronics trigger RMA + replacement + shipping; debug labour at €80-120/hr |
| Obsolescence reserve | Not in base model | **Add line: 8-15% of inventory value/year** | Chip revisions, EOL components, spec drift |
| CBAM exposure | Included | **Negligible** | CBAM scope is iron/steel/aluminium/cement/fertilisers/H2/electricity — PCBAs not covered directly, though steel chassis + aluminium heat sinks may trigger it |
| Switching cost (tooling) | €15-50k | **€30-80k** | Test fixtures, ICT probe cards, functional test programs |
| Risk premium (single-source) | 3% | **4-5%** | Many ICs are single-sourced by the component maker, not just the CM — geographic diversification alone doesn't fix this |
| Currency hedging | 0.5-1.5% | **1.5-2.5%** | USD exposure on most Asia quotes; BOM costs move with component indices |
| FX buffer | 3-5% | **2-3%** on USD, 0% on EUR, **5-8%** on TWD/KRW | Taiwan/Korea currencies less liquid |

**Typical gotcha:** The quoted BOM cost is a snapshot. Every BOM line is subject to shortage/surplus pricing swings — a 2021-style MCU shortage can add 30-80% to a €12 board for 18 months. Model a **BOM volatility reserve of 3-5% on unit price** separately from FX hedging. If you don't have it, you'll miss the winner-flip the next time there's an allocation crunch.

---

## 1.2 Metal parts / machined components

**Context:** Turned, milled, cast, stamped, forged metal parts. Automotive, appliance, industrial, medical housings. Typical EU buyer comparing China vs. Turkey/Poland/Portugal/Romania.

This is the default calibration in the shipped XLSX. Confirming the numbers rather than overriding:

| Parameter | Default | Confirm |
|---|---|---|
| Cost of capital (WACC) | 8.0% | 7-10% typical for industrial mid-market |
| Inventory carrying rate | 20.0% | Correct — general industrial goods |
| Defect rework multiplier | 3× | Correct for reworkable dimensional defects; use 10× when the part goes into an assembly that has to be torn down |
| CBAM | 0.06 EUR/kg steel, 0.04 EUR/kg Turkish steel | **Confirm HS code coverage**: finished machined parts may escape CBAM if HS code isn't in the covered list, but raw steel/iron/aluminium imports are fully covered. 30-80 EUR/tonne range holds for 2026; rising |
| Switching cost (tooling) | €15-50k | Custom dies €30-150k; standard turning fixtures €5-15k |
| Risk premium | 3% | Correct; raise to 5% for single-supplier custom castings with long qualification |

**Typical gotcha:** Buyers comparing Chinese and nearshore machining quotes often forget the **raw material spec delta**. Chinese mills may ship EN-equivalent steel that meets chemistry but not traceability requirements (EN 10204 3.1 mill cert traceable to heat number). If your customers demand 3.1 certs, you're paying €0.20-0.40/kg extra at the Chinese supplier for proper certs — or paying €2-5k per incident when a customer audit rejects the batch. Price this as a line item, not a risk premium.

---

## 1.3 Apparel / textiles

**Context:** Garments, knits, woven fabrics, home textiles. Typically Turkey, Portugal, Bangladesh, India, China. Seasonality is the dominant driver.

| Parameter | Default | Apparel override | Reason |
|---|---|---|---|
| Cost of capital (WACC) | 8.0% | 9-11% | Retail/apparel WACC runs higher than industrial |
| Inventory carrying rate | 20.0% | **28%** | Season-bound SKUs with sharp obsolescence: end-of-season markdown recovers only 40-60% of cost; add 8-10pp for obsolescence on top of normal carrying |
| Defect rework multiplier | 3× | **2×** | Most defects are reworkable at low cost (re-stitching, re-pressing); scrap rate lower than industrial |
| CBAM exposure | Included | **Zero** | Textiles not in CBAM scope |
| CSRD / supply chain disclosure | Not in base | **Add line: compliance cost 0.5-2% of unit price** | CSDDD phase-in from 2027 requires traceability from raw fibre; cost of audit trail is real |
| Switching cost (tooling) | €15-50k | **€3-12k** | Mostly sampling + pattern grading; no hard tooling |
| Risk premium (single-source) | 3% | **2-4%** | Fashion seasonality means you can always buy from someone, but quality and on-time matter more than price |
| FX buffer | 3-5% | **8-12% TRY**, 0% EUR, 3-5% USD | Lira volatility is structural |
| Late delivery cost | Not in base | **Add line: 25-50% markdown on late-season arrivals** | 2-week delay = full-price season window gone for fashion; model this as a contingent cost |

**Typical gotcha:** Apparel buyers benchmark on FOB unit price and completely miss the **lost-margin-on-markdown** cost of late delivery. A €8 FOB garment that arrives 2 weeks late into a 12-week fashion season doesn't cost 2/12 of margin — it often costs 40-60% of margin because full-price sell-through window collapses. Late delivery is the single biggest TCO driver in fashion and the most commonly ignored. Model it. Don't wave it away.

---

## 1.4 Medical device components

**Context:** Housings, cables, connectors, electromechanical sub-assemblies for Class I/IIa/IIb medical devices. EU MDR or US FDA 510(k) regulated. Buyer is a medtech OEM or contract manufacturer.

| Parameter | Default | Medical override | Reason |
|---|---|---|---|
| Cost of capital (WACC) | 8.0% | 9-11% | Medtech WACC |
| Inventory carrying rate | 20.0% | **22%** | Longer shelf life tolerance but tighter lot traceability; storage cost comparable to industrial |
| Defect rework multiplier | 3× | **10-30×** | Field failure on a medical device triggers: MDR vigilance report, customer notification, potential recall, FDA 483, CAPA. Full-recall cost per unit can be 30-100× unit price. If part is in an implanted device, price separately at 100× minimum |
| MDR / FDA compliance overhead | Not in base | **Add line: 3-8% of unit price** | PCN/ECR change control, design history file upkeep, process validation maintenance |
| Audit cost (upfront) | €3-8k | **€15-40k** | ISO 13485 audit, process validation review, sterility/biocomp if applicable |
| Switching cost (tooling) | €15-50k | **€50-200k** | Tooling + IQ/OQ/PQ validation + design freeze + notified body notification |
| Risk premium (single-source) | 3% | **5-8%** | Supplier change requires regulatory notification; single-source dependency is an audit finding in many regulated contexts |
| Qualification hours | 40-120 | **200-600** | Full process validation |

**Typical gotcha:** Medical device TCO models consistently under-price the **cost of a supplier change**. The direct tooling cost is often €50-150k, but the indirect cost — regulatory notification, validation maintenance, design history file updates, notified body review where applicable — can add another €100-300k in hidden effort and delay. For a Class IIb device, the switching cost calculation should include a separate "regulatory path" line priced at €80-250k depending on change classification. If the unit saves €0.40/unit but switching costs €200k and you only buy 50k units/year, payback is 10 years. Don't switch.

---

## 1.5 Packaging / consumables

**Context:** Corrugated, folding cartons, labels, films, bottles, caps, closures. Consumed with the finished product, often high volume, low unit price.

| Parameter | Default | Packaging override | Reason |
|---|---|---|---|
| Cost of capital (WACC) | 8.0% | 7-9% | Typical industrial |
| Inventory carrying rate | 20.0% | **15%** | Packaging turns faster than component inventory; lower obsolescence (except for printed SKU-specific items) |
| Defect rework multiplier | 3× | **1.5×** | Most defective packaging is scrapped cheaply, not reworked; scrap cost is unit price + a handling fee |
| CBAM exposure | 0-0.06 EUR/kg | **Relevant for: paper from non-EU origin, aluminium foil from non-EU, cans/ends from non-EU** | Paper/pulp not currently in CBAM but aluminium containers are |
| Switching cost (tooling) | €15-50k | **€2-10k for plates/cutting dies; €30-80k for custom bottle moulds** | Varies widely by subcategory |
| Risk premium | 3% | **1-2%** | Commodity-like with many substitutes, except custom printed SKUs |
| Minimum order impact | Not in base | **Add line: 5-15% of unit price** | MOQs on printed runs force over-buying; obsolete stock on SKU change is a real cost — model as a reserve |
| Plastic packaging tax (EU/UK) | Not in base | **Add line: 0.20-0.80 EUR/kg for recycled content below threshold** | UK plastic packaging tax, Spanish/Italian equivalents, 30% recycled-content thresholds |

**Typical gotcha:** Packaging TCO is dominated by **waste from SKU changes and MOQ mismatch**, not unit price. A €0.042 folding carton looks identical across three suppliers — but the one with a 10,000-unit MOQ and 8-week lead time will leave you with €4,000 of obsolete stock every time marketing reshuffles the brand mandatory. Model a "waste from SKU churn reserve" of 3-8% of annual spend, calibrated to your actual SKU change rate. And separately check the supplier's willingness to hold print plates without charging storage — that's a €2-5k/year hidden cost otherwise.

---

\newpage

# 2. Sensitivity dashboard — how to read tab 3

The Sensitivity tab is the one that converts a TCO exercise from a spreadsheet into a decision. Most buyers skip it, report a baseline TCO to the CFO, sign a contract, and discover in Q2 that FX moved or the Red Sea rerouted and the "winner" is now the worst option. This section walks through each variable so you can read the tab without guessing.

## 2.1 What each sensitivity variable does

**FX rate change (±5%, ±10%)**

- Applied to: unit price + freight + duties + hedging cost for the supplier whose quote currency is affected
- China quote in USD: when USD strengthens +10% vs EUR, the EUR-equivalent unit price rises +10%; a €8.95 unit becomes €9.85, and all downstream cost categories scale accordingly
- Turkey quote in EUR or TRY: if Turkey quotes in EUR, FX is mostly the supplier's problem (they may request renegotiation mid-contract — price this as a separate risk). If Turkey quotes in TRY, FX stress flips the other way: TRY weakening makes the EUR-equivalent cost fall on your side
- Rule of thumb: test ±5% as "normal volatility" and ±10% as "crisis volatility". Both happen every 18-24 months on most currency pairs

**Lead time change (+14 days, +30 days)**

- Applied to: inventory carrying cost (recalculated with the new lead time) + currency hedging cost (if your hedge tenor mismatches extended lead time)
- +14 days (Red Sea realistic): adds roughly `unit_price × carrying_rate × (14/365)` to carrying cost. For a €10 unit at 20% carrying: €0.077 per unit
- +30 days (port strike / major disruption): adds `unit_price × carrying_rate × (30/365)` ≈ €0.16 per unit on a €10 base
- Secondary effect often missed: longer lead time forces larger safety stock, which scales carrying cost non-linearly. Safety stock typically scales with √(lead time), so a doubling of lead time adds about 40% to safety stock, not 100%

**Tariff change (+5pp, +15pp)**

- Applied to: import duties line on the affected origin
- For a Chinese-origin part entering the US, a +15pp Section 301 expansion on a €10 unit adds €1.50 directly to duties
- For EU origin, tariff changes generally don't apply (intra-EU movement is duty-free); the exception is anti-dumping/anti-subsidy duties which the EU can and does apply to specific categories (Chinese EVs 2024, PV 2025)
- When running this scenario, include a separate cost line: **customs broker handling time on disputed classifications** — €300-800 per shipment

**CBAM scenario (€30/t, €50/t, €75/t, €150/t)**

- Applied to: the CBAM line on non-EU iron/steel/aluminium origin
- Current 2026 range: €30-50/tonne embedded CO2 equivalent
- 2027-2028 forecast: €75-150/tonne as free allowances phase out
- On a €10 steel part weighing 1 kg with 2 kg CO2e embedded: €0.06 at €30/t, €0.30 at €150/t. On a 5 kg part, scale up 5×

**Compound stressors**

- The calculator supports combining two or three variables. This is where winners often flip irreversibly
- Realistic compound: USD +10% + Red Sea +14d + CBAM +€25 — this is not a worst case, it is a reasonable 2026 scenario combining drivers that already occurred
- If your baseline winner survives the compound test, proceed. If not, the second-rank supplier in baseline is usually the robust choice

## 2.2 Walked example — China vs. Poland under Red Sea delay

Take the shipped sample:

- Supplier A (China): unit price €8.95, baseline TCO €11.64, rank 1
- Supplier C (Poland): unit price €12.40, baseline TCO €12.83, rank 5

China wins baseline by €1.19 per unit, or €59,500 per year at 50,000 units. CFO signs off on China. Buyer books contract.

Now apply the Red Sea disruption scenario (+14 days lead time on China):

**Step 1 — Recalculate China carrying cost**

- Baseline carrying: €0.31 (lead time 56 days, unit price €8.95, carrying rate 20%, formula `8.95 × 0.20 × 56/365`)
- New carrying: `8.95 × 0.20 × 70/365 = €0.343`
- Delta: +€0.033 per unit. Looks small.

**Step 2 — Recalculate China safety stock cost**

- Safety stock was sized for 56 days lead time and some demand variability. With lead time up to 70 days, safety stock scales roughly `√(70/56) = 1.118`
- If baseline safety stock was 14 days of cover at €8.95 unit price (€0.048 per unit amortized), new safety stock adds another ~10% to that: €0.053 per unit. Delta +€0.005

**Step 3 — Recalculate freight premium**

- Red Sea routing in 2026 adds roughly 15% to Asia-Europe sea freight. Baseline €0.75 freight becomes €0.86. Delta +€0.11 per unit

**Step 4 — Compound these**

- China new TCO: €11.64 + 0.033 + 0.005 + 0.11 = €11.79
- China still wins? Yes, but margin is now €11.79 vs €12.83 for Poland — gap narrowed from €1.19 to €1.04

**Step 5 — Add a realistic compound: Red Sea + USD strengthens 5%**

- USD +5% hits China unit price, duties, hedging: unit price €8.95 → €9.40, duties €0.54 → €0.57, hedging €0.05 → €0.053
- Add to the Red Sea-adjusted TCO: €11.79 + 0.45 + 0.03 + 0.003 = €12.27
- Now China wins by €0.56 per unit vs. Poland's €12.83 — still winning, but by €28,000/year on 50k units, not €59,500

**Step 6 — Add second compound: CBAM escalates from €30 to €75/t**

- China CBAM was €0.42 per unit at €30/t embedded. At €75/t it's €1.05 per unit. Delta +€0.63
- New China TCO: €12.27 + 0.63 = €12.90

**China loses.** Poland €12.83 vs China €12.90. Under three realistic compound stressors (Red Sea + mild USD strengthening + expected CBAM escalation), the ranking flips. Buyer who signed baseline-only is looking at a €3,500/year loss instead of €59,500/year saving — a €63,000 swing on 50k units/year.

## 2.3 How to use the tab in practice

1. Run baseline to identify the nominal winner
2. Run each single-variable scenario (5 total: FX+5%, FX+10%, lead time +14d, tariff +5pp, CBAM +€25/t)
3. Count how many single-variable scenarios preserve the winner
4. Run the worst-case compound (all three stressors pointing against the baseline winner)
5. Decision rule:
   - **Winner survives all 5 single scenarios + compound** → robust choice, proceed
   - **Winner survives 4/5 single + compound** → proceed with mitigation (see section 4)
   - **Winner survives ≤3/5 or loses compound** → fragile choice; seriously consider the runner-up or dual-source

---

\newpage

# 3. How to rebuild the XLSX in 15 minutes

If you only have the three CSVs (or you want to customise beyond the shipped XLSX), here is the step-by-step to produce a working workbook. Takes 15 minutes for a competent Excel user, 25 for a cautious one.

## 3.1 Create the workbook and load tabs

1. Open Excel, File → New → Blank workbook
2. File → Open → select `tco-calculator-tab1-categories.csv`. It opens as an unnamed sheet. Rename the tab to `Categories` (right-click tab → Rename)
3. Move this sheet into the blank workbook: right-click tab → Move or Copy → select new workbook → tick "Create a copy" if you want to keep the CSV intact
4. Repeat for `tco-calculator-tab2-comparison.csv` → rename tab to `Comparison`
5. Repeat for `tco-calculator-tab3-sensitivity.csv` → rename tab to `Sensitivity`
6. Save as `tco-calculator.xlsx` (not .xls, not .csv)
7. Add a new tab called `Assumptions` at the start (right-click any tab → Insert → Worksheet, drag to position 1)

## 3.2 Build the Assumptions tab

On the new `Assumptions` tab, paste this structure into A1:

| Cell | Value | Label (in column A) |
|---|---|---|
| B1 | 0.08 | `Cost of capital` |
| B2 | 0.20 | `Inventory carrying rate` |
| B3 | 3 | `Rework multiplier` |
| B4 | 0.03 | `Single-source risk premium` |
| B5 | 0.01 | `Currency hedging cost (of unit price)` |
| B6 | 30 | `CBAM price per tonne CO2e (EUR)` |
| B7 | 0.05 | `FX buffer (volatile currencies)` |
| B8 | 60 | `Target payment terms (days)` |

Name these ranges (Formulas → Define Name) so formulas are readable:

- `WACC` = `Assumptions!$B$1`
- `CarryRate` = `Assumptions!$B$2`
- `ReworkMult` = `Assumptions!$B$3`
- `RiskPrem` = `Assumptions!$B$4`
- `FXHedge` = `Assumptions!$B$5`
- `CBAMPrice` = `Assumptions!$B$6`
- `FXBuffer` = `Assumptions!$B$7`
- `TargetTerms` = `Assumptions!$B$8`

## 3.3 Wire the Comparison tab — 8 formulas

The CSV has static values. Replace them with formulas referencing the Assumptions tab and upstream inputs. Column B = Supplier A (China), C = Supplier B (Turkey), etc.

You'll need an **Inputs** block at the bottom of the Comparison tab (rows 20-30) to hold: lead time (days), PPM defect rate, actual payment terms (days), embedded CO2 kg per unit, quote currency, FX rate at quote date, tooling cost, audit cost, qualification hours, first-year units. Add these as rows with values pasted from supplier quotes.

**Formula 1 — Inventory Carrying Cost (row 6)**

```
= B2 * CarryRate * (Lead_Time_Days / 365)
```

where `B2` = unit price, `Lead_Time_Days` references the lead time input row (e.g. `B21`).

Worked: 8.95 × 0.20 × (56/365) = 0.274 — close to the sample 0.31 (which uses slightly different rate).

**Formula 2 — Defect / Rework Cost (row 7)**

```
= (PPM_Row / 1000000) * ReworkMult * B2
```

Worked: (500/1,000,000) × 3 × 8.95 = 0.0134 — matches sample ~0.13 if PPM is 5000.

**Formula 3 — Payment Terms Cost (row 8)**

```
= IF(Actual_Terms >= TargetTerms, 0, ((TargetTerms - Actual_Terms)/365) * B2 * WACC)
```

Worked (Target 60, actual 30, unit €8.95): (30/365) × 8.95 × 0.08 = 0.059.

If you want NPV-style treatment for longer contracts, use:

```
= B2 - (B2 / (1 + WACC)^((TargetTerms - Actual_Terms)/365))
```

This discounts the payment stream properly. For contracts under 12 months, the simpler linear formula is within 2% of the NPV answer — use it and move on.

**Formula 4 — Switching Cost Amortization (row 9)**

```
= (Tooling + Audit + (QualHours * HourlyRate)) / FirstYearUnits
```

Worked: (15000 + 5000 + 60*100) / 50000 = 0.52. Matches sample.

**Formula 5 — Import Duties (row 4, with conditional logic)**

```
= IF(Origin_Country = "EU", 0, IF(Origin_Country = "CN_US_301", B2 * 0.25, B2 * HTS_Rate))
```

Use a lookup table on a separate tab if you have multiple origins:

```
= IFERROR(B2 * VLOOKUP(Origin_Code, Duty_Table, 2, FALSE), 0)
```

**Formula 6 — CBAM Adjustment (row 5)**

```
= IF(Origin_Country = "EU", 0, Embedded_CO2_kg_per_unit * (CBAMPrice / 1000))
```

Worked (Chinese steel, 2 kg CO2e per unit, €30/t): 2 × (30/1000) = €0.06. Adjust embedded CO2 per part weight.

**Formula 7 — Risk Premium (row 10)**

```
= B2 * IF(SingleSource = "Yes", RiskPrem, 0)
```

or if you want a gradient:

```
= B2 * VLOOKUP(Sourcing_Type, {"Commodity",0;"Dual",0.01;"Strategic",0.03;"SoleSource",0.05}, 2, FALSE)
```

**Formula 8 — Total TCO per Unit (row 12) — weighted SUMPRODUCT variant**

Simple sum:

```
= SUM(B2:B11)
```

If you want to weight categories differently (e.g. double-count risk for strategic suppliers), use SUMPRODUCT with a weights column on the Assumptions tab:

```
= SUMPRODUCT(B2:B11, Assumptions!$C$10:$C$19)
```

where `C10:C19` are weights (all 1 for equal weighting, higher for over-weighted categories).

**Formula 9 — Rank by TCO (row 18)**

```
= RANK(B12, $B$12:$F$12, 1)
```

Ascending rank; 1 = lowest total = best. If you have ties, use `RANK.EQ` with a tiebreaker:

```
= RANK.EQ(B12, $B$12:$F$12, 1) + COUNTIF($B$12:B12, B12) - 1
```

## 3.4 Wire the Sensitivity tab — one lookup + one scenario driver

The Sensitivity tab holds scenarios as rows and recomputes TCO per supplier per row. You have two options.

**Option A (simple, manual): Hard-code the scenario deltas**

Leave the Sensitivity tab as static values (the shipped CSV). Update manually when assumptions change. Takes 5 minutes, works fine for one-off analysis.

**Option B (live, linked to Comparison): Use a scenario input block**

Add a scenario selector at the top of the Sensitivity tab (cell B1 = dropdown with scenario names). Use a VLOOKUP to pull the FX delta, lead time delta, tariff delta, CBAM delta from a scenario definitions table. Then recompute TCO inline:

```
Cell for China TCO under selected scenario:
= Comparison!B12
  + (Comparison!B2 * FX_Delta)     // unit price FX adjustment
  + (Comparison!B2 * Tariff_Delta) // tariff adjustment
  + (Comparison!B2 * CarryRate * (Lead_Time_Delta / 365)) // extended carrying
  + (Embedded_CO2_per_unit * (CBAM_Delta / 1000))
```

Option B is 30 minutes more setup and saves 2-3 minutes per scenario after that. Worth it if you'll run >5 scenarios. Not worth it for a one-off.

## 3.5 Chart and final polish

1. On the Comparison tab, select range `A1:F1` and `A12:F12` (supplier names and total TCO row)
2. Insert → Chart → Clustered Bar
3. Title: "TCO per Unit by Supplier (EUR)"
4. Sort supplier axis by TCO ascending (right-click axis → Sort → Smallest to largest)
5. Add data labels (right-click bars → Add Data Labels)
6. Save. Done.

Optional: add conditional formatting to the Rank row (1 = green, last = red) so the winner pops visually.

---

\newpage

# 4. What to do when the winner flips

Sensitivity analysis often reveals the uncomfortable truth that your baseline winner is fragile — flips under two or more realistic stress scenarios. Five decision rules for what to do next.

## 4.1 Rule 1 — Dual-source the category if switching costs allow

If the cost of qualifying a second supplier (tooling, audit, qualification hours) is less than **12-18 months of expected-value disruption cost**, dual-source. The math:

- Expected-value disruption cost = (probability of disruption in 12 months) × (cost per month of disruption) × (expected disruption duration in months)
- Example: 15% probability of Red Sea re-escalation in 12 months × €120k/month revenue at risk × 2 months = €36k expected value
- If qualifying Supplier B costs €25k in tooling + audit, the dual-source ROI is immediate

Split volume 70/30 or 60/40 in favour of the lowest-TCO supplier, with a pre-qualified standby at the second. Standby means audited, tooling installed (even if idle), sample approved. Activating the standby should take under 4 weeks, not 4 months.

## 4.2 Rule 2 — Lock in FX when the flip driver is currency

If sensitivity shows the winner flips on a 5-10% FX move, and you have contract duration of 6-18 months, hedge.

- Forward contracts for 50-70% of expected spend are standard practice and cost 0.5-1.5% of the notional
- Options cost more (2-4% of notional) but preserve upside if FX moves favourably
- CFO's call on forwards vs. options; don't second-guess

Worked: €5M annual spend in USD. Forward to lock EUR/USD for 12 months: ~€50k cost. If EUR weakens 10% in that period, you save €500k. Payoff ratio is asymmetric in favour of hedging.

Don't hedge if:
- Contract is flexible-priced (supplier renegotiates quarterly)
- You have natural hedge (you also export in that currency)
- Amount is below €500k — hedge admin overhead isn't worth it

## 4.3 Rule 3 — Use sensitivity results as negotiation leverage

The supplier who wins baseline but loses under stress has a weak position in the next round. Don't reveal this publicly in the RFQ, but know it.

Concrete moves:
- Ask baseline-winner for price protection clause: "unit price held for 12 months regardless of FX movement ±5%". They may accept; they know they're at risk too
- Ask for lead time commitment: "€X per day penalty for delivery beyond quoted lead time + 5 days". This forces the supplier to price their own disruption risk
- Ask for CBAM indemnity: "supplier absorbs CBAM cost increases above €50/tonne for 12 months". Non-EU suppliers will push back, which tells you the supplier expects CBAM to escalate

If supplier refuses all three, your baseline winner is effectively quoting a worse price than printed — they've flagged risk they want you to carry.

## 4.4 Rule 4 — Shift to the runner-up if the flip is on two or more stressors

Shipped sample: China wins by 2% on baseline TCO. Under USD +5%, Red Sea +14d, or tariff +15pp, Turkey wins. That's three out of three independent stressors flipping the ranking — China's win is fragile across the board.

Rule: **if the runner-up wins under 2+ of the 5 single-variable stress tests, shift the volume to the runner-up** unless the price premium exceeds 5% of annual category spend.

Sample math: Turkey's baseline premium over China = €11.89 − €11.64 = €0.25/unit × 50,000 = €12,500/year. Is it worth paying €12,500/year for a winner that survives all 5 stress scenarios? Almost always yes. That's a €12,500 insurance premium against a €60k+ annual loss in stress scenarios. Buy the insurance.

Exception: if your company genuinely cannot absorb the €12,500 premium (low-margin business, mid-market procurement with hard savings targets), document the risk exposure to management and take the fragile winner consciously. At least the decision is explicit.

## 4.5 Rule 5 — Re-evaluate annually, not at contract signing

Sensitivity reveals a winner is fragile. You signed them anyway because contract terms are locked. Now what?

Put a **re-evaluation milestone at month 9** of a 12-month contract. Purpose: run the TCO model again with actuals (real FX movement, real lead times, real defect rates), not quotes. Outputs:

- If winner held: renew at favourable terms, extract volume discount for continuation
- If winner is underperforming on TCO basis: put backup supplier activation plan in motion at month 10, negotiate contract-end at month 12
- If sensitivity risk materialized: use it as leverage for renegotiation or termination

This discipline converts sensitivity analysis from a one-time exercise into a continuous signal. Buyers who do this beat buyers who sign-and-forget by 3-7% of category spend annually, documented across the Procurea beta cohort.

---

\newpage

# 5. Common TCO mistakes — the six that wreck the comparison

Six mistakes that show up in roughly half of practitioner TCO models we see. Each has a symptom (how the mistake shows up in your spreadsheet) and a fix.

## 5.1 Comparing EXW to DDP without normalizing Incoterms

**Symptom:** Supplier A quotes EXW factory gate in Shenzhen. Supplier B quotes DDP your warehouse in Rotterdam. Supplier A looks 15% cheaper on unit price. It isn't. DDP quote already includes freight, duties, and EU-side customs clearance. EXW doesn't.

**Fix:** Normalize both quotes to the same Incoterm before any cost category comparison. The cleanest baseline is **DAP your receiving dock** — all costs to door, no duties included (duties are buyer-side reclaimable or non-reclaimable depending on jurisdiction). If supplier quotes EXW, your freight forwarder can give you a ±10% freight+customs estimate in 24 hours — add that to the unit price BEFORE running any TCO comparison.

Mistake frequency: high. Costs: 8-15% mis-ranking on any cross-Incoterm comparison.

## 5.2 Ignoring MOQ mismatch and over-buy

**Symptom:** Supplier A quotes €4.20/unit with 5,000-unit MOQ. Supplier B quotes €4.80/unit with 1,000-unit MOQ. Your annual demand is 6,000 units. Supplier A wins on unit price by €0.60/unit = €3,600/year savings.

But you buy 10,000 units (two MOQ runs) to cover 6,000 demand — 4,000 units sit in inventory for 8 months at 20% carrying = €4.20 × 4,000 × 0.20 × 8/12 = €2,240 extra carrying cost. Plus if those 4,000 units become obsolete because of an SKU change, you scrap €16,800 of stock. The "winner" is now the loser.

**Fix:** Add a **MOQ over-buy reserve** line to any TCO comparison where supplier MOQs exceed your single-order demand. Calculate as:

```
MOQ_Reserve = (MOQ - Expected_Order_Size) × Unit_Price × (Carrying_Rate × Expected_Holding_Time_Years + Obsolescence_Probability)
```

Obsolescence_Probability ranges from 0 (stable commodity) to 0.5+ (seasonal apparel, printed packaging). Rule of thumb: if you can't name the SKU change cycle, assume 0.2.

Mistake frequency: very high on mid-market procurement. Costs: 3-15% of unit price for small-demand categories.

## 5.3 Not counting planner-hours and coordination overhead

**Symptom:** Supplier A is in China. Supplier B is in Poland. TCO model shows €0.30/unit difference. What the model doesn't show: Supplier A requires 6 hours/week of your planner's time (WeChat coordination, QC calls at 6am, logistics re-schedules). Supplier B requires 1 hour/week.

At €60/hour loaded cost for a planner, the delta is 5 hours × €60 × 50 weeks = €15,000/year of planner time going to manage the Chinese supplier. On 50,000 units/year, that's €0.30/unit — exactly the savings the TCO model showed.

**Fix:** Add a **coordination overhead** line. Pragmatic values:

- Local/regional supplier (same time zone, same language): €0.02-0.05/unit
- Adjacent region (EU-Turkey, US-Mexico): €0.05-0.12/unit
- Distant region (EU-China, US-Vietnam): €0.15-0.35/unit

If your quality team also spends disproportionate time, add a quality-coordination line too. The "invisible tax" on distant supplier relationships is real and often bigger than the advertised unit-price saving.

Mistake frequency: near-universal. Costs: 2-8% of category spend.

## 5.4 Treating one-time costs as negligible

**Symptom:** TCO model amortises tooling over 3-5 years, then writes "€0.05/unit" in the switching cost row. Meanwhile the supplier being displaced has existing tooling with 2 more years of life. Displacing them means walking away from a €40,000 book value in existing tooling.

**Fix:** If displacing an existing supplier, include the **stranded tooling cost** as a line item — not amortised, but taken as a year-1 hit. On a 50k unit/year category with €40k stranded tooling, that's €0.80/unit in year 1. The new supplier needs to beat the incumbent by €0.80+/unit just to break even in year 1.

Also count: inventory obsolescence at the incumbent (any parts in your warehouse specific to their process), qualification time for the new supplier (80-200 hours for any non-trivial change), and the "lost improvement" cost — incumbents often know your process and catch errors; new suppliers take 6-12 months to match that implicit value.

Mistake frequency: medium. Costs: year-1 TCO off by €0.50-2.00/unit on categories with prior tooling investment.

## 5.5 Running TCO on quote, not on landed cost

**Symptom:** Finance asks for "TCO analysis" pre-award. Buyer pulls quote data, builds model, shows winner. Supplier is awarded. Three months in, actual landed cost is 12% higher than modelled — driven by freight variance, a duty classification dispute, one batch of quality issues, and 10 days of lead time slippage that weren't in the model.

**Fix:** Two parts.

**Part A:** Model with ranges, not point estimates, on the variable lines. Freight: range 0.60-0.95 per unit. Duties: 0-8% depending on HTS classification outcome. Quality: PPM 500-2,000 in year 1 (ramp). Report TCO as a range, not a number. The CFO may push back wanting a single number; give them the midpoint with the explicit range shown.

**Part B:** Do a **post-award actual-vs-modeled** review at month 3 and month 9. If variance is >10%, update the model and re-share with the approver. This builds a calibration loop so future quotes get modelled closer to landed reality.

Mistake frequency: very high. Costs: systematic 5-15% over-estimate of savings, erodes credibility of procurement team over time.

## 5.6 Using a generic carrying rate for every category

**Symptom:** Every TCO model in the company uses 20% carrying rate. Fashion inventory gets 20%. Screws get 20%. Medical devices get 20%. None of them are 20%.

**Fix:** Build a category-specific carrying rate table and use it consistently. Rough calibration:

| Category | Carrying rate | Why |
|---|---|---|
| High-velocity consumables | 12-15% | Fast turn, low obsolescence |
| Industrial / MRO | 18-22% | Moderate turn, moderate obsolescence |
| Electronics / tech | 22-30% | Moderate turn but high obsolescence (chip revisions) |
| Fashion / seasonal | 28-40% | Hard obsolescence at end of season |
| Pharma / food short-shelf | 25-35% | Expiry risk |
| Strategic / long-life | 10-15% | Slow turn but stable value |

If you've never calibrated per category, the fix is 2 hours: pull last 3 years of inventory, calculate actual obsolescence write-off rate per category, add 8-10pp (cost of capital + storage + insurance). You'll find the 20% default was badly wrong for 60%+ of your categories.

Mistake frequency: near-universal. Costs: 1-5% distortion in rankings, especially between short-lead-time local suppliers and long-lead-time offshore.

---

\newpage

# Appendix — One-page assumption cheat sheet

Print this and stick it next to your monitor. All the defaults in one table.

| Parameter | Default | Volatile |
|---|---|---|
| Cost of capital (WACC) | 8.0% | 6-12% |
| Inventory carrying rate | 20.0% | 12-40% by category |
| Rework multiplier | 3× | 1.5× (packaging) to 30× (medical) |
| Risk premium (single source) | 3% | 0-8% |
| CBAM price (2026) | €30-50/tonne | €75-150/tonne by 2028 |
| Currency hedging | 0.5-1.5% | 2-4% with options |
| FX buffer (volatile currencies) | 3-5% | 8-12% TRY, 10%+ ARS/ZAR |
| Freight (sea, Asia-EU) | €0.70-0.90/unit | +15% Red Sea premium |
| Freight (road, intra-EU) | €0.10-0.25/unit | +5-8% diesel swings |
| Target payment terms | Net 60 | Industry-dependent |
| Switching cost (tooling, typical industrial) | €15-50k | €50-200k medical |
| Qualification hours | 40-120 | 200-600 medical/aerospace |
| Planner overhead, distant supplier | €0.15-0.35/unit | €0.35+ for complex custom |
| Obsolescence reserve (fashion) | 30-40% | Higher for fast fashion |
| Plastic packaging tax (UK 2026) | £217.85/tonne | EU equivalents 0.20-0.80 EUR/kg |

---

Published by Procurea, April 2026. Companion to `tco-calculator.xlsx` and README.md. Revised quarterly.
