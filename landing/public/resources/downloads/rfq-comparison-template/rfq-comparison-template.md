---
title: "RFQ Comparison Template — Buyer's Guide"
subtitle: "Three worked examples, supplier-omission checklist, weighted-scoring math"
author: "Procurea"
date: "April 2026"
version: "1.0"
---

\newpage

# RFQ Comparison Template — Buyer's Guide

## Three worked examples. Ten things suppliers always leave out. A scoring model that survives audit.

Most RFQ comparison templates give you column headers and call it done. This one shows you what a filled-in comparison looks like, where unit price lies to you, and how to write a Notes column that a category director can defend three months later.

Built from the patterns we see in Procurea's beta cohort — mid-market buyers running 8-40 RFQs per quarter across commodity, strategic, and regulated categories. Not a consulting framework; a practitioner's reference.

**Published:** April 2026
**Next revision:** October 2026

---

\newpage

# Table of contents

1. How to use this guide (page 3)
2. Three worked RFQ examples (pages 4-11)
   - Example 1: Commodity — corrugated packaging, PL/TR/CN/PT (pages 4-5)
   - Example 2: Strategic — contract electronics manufacturing, PL/TR/PT (pages 6-8)
   - Example 3: Regulated — medical device component, DE/PL/IE (pages 9-11)
3. Ten things suppliers always omit from quotes (page 12)
4. How to fill the Notes column — micro-guide (page 13)
5. Weighted scoring — worked math with weight swap (pages 14-15)
6. Calibration rules before you start scoring (page 16)
7. Country-by-country normalization cheat sheet (page 17)
8. Five scoring pitfalls that kill defensibility (page 18)
9. When to disqualify a quote before scoring (page 19)
10. Negotiation after scoring — turning the score sheet into leverage (page 20)
11. Glossary — the acronyms you'll see in quotes (page 21)
12. Appendix: the 10-field comparison structure recap (page 22)
13. RFQ cover-letter template — what to send with the request (page 23)
14. Common supplier tactics and how to spot them (page 24)

---

\newpage

# 1. How to use this guide

This guide is meant to be read **once**, then kept open in a second tab while you fill the CSV or XLSX for a real RFQ. The three worked examples are not illustrations — they are the reference patterns. When you get stuck deciding whether to shortlist supplier B at €11.40 against supplier A at €10.80, re-read the example that matches your category archetype and copy the reasoning structure.

**Three category archetypes, three weighting schemes:**

| Archetype | Example category | Price weight | Quality weight | Lead time | Terms |
|---|---|---|---|---|---|
| **Commodity** | Packaging, standard fasteners, bulk raw materials | 50% | 20% | 20% | 10% |
| **Strategic** | Contract manufacturing, custom injection moulding, PCBA | 25% | 35% | 20% | 20% |
| **Regulated** | Medical devices, aerospace parts, food contact materials | 20% | 45% | 20% | 15% |

The worked examples below each use the archetype-appropriate weights. Don't port commodity weights into a regulated RFQ. The scoring model is only defensible when the weights match the category.

**Three rules of thumb before you open the spreadsheet:**

1. **Normalize currency and Incoterm before scoring.** A TRY quote at EXW Istanbul is not comparable to an EUR quote at DDP Munich. Convert both to EUR DDP-destination before the first row of scoring math runs. A 3-5% FX buffer is normal; build it into the price column, not as a mental adjustment.
2. **Never score an incomplete row against a complete row.** If one supplier omits MOQ or lead time, send them a follow-up and mark the row "pending." Scoring against zero is not a blank — it is false data.
3. **Version-lock the weights before the first quote arrives.** Email the spreadsheet to your category director with the weights set. Timestamped. This is the single biggest audit-defence move.

---

\newpage

# 2. Three worked RFQ examples

## Example 1 — Commodity: corrugated packaging (boxes, 4-flute, 300×200×150mm)

**Scenario:** Mid-market consumer goods company in Poland. Annual volume: 2.4M boxes. Category was single-sourced in Germany; board asked for a 20% landed-cost reduction and a second supplier for continuity. RFQ sent to 4 suppliers across PL, TR, CN, PT.

**Weights applied (commodity archetype):** Price 50 / Quality 20 / Lead Time 20 / Terms 10

### Filled comparison table

| Field | Kartpol Opakowania (PL) | BursaKraft Ambalaj (TR) | Qingdao Huabang (CN) | Embalpack Coimbra (PT) |
|---|---|---|---|---|
| Legal entity | Kartpol Sp. z o.o. | BursaKraft Ambalaj A.S. | Qingdao Huabang Pkg Ltd. | Embalpack SA |
| Country of production | Poland | Turkey | China | Portugal |
| Unit price (EUR, DDP buyer DC) | €0.42 | €0.38 | €0.29 | €0.44 |
| MOQ (units) | 50,000 | 100,000 | 250,000 | 30,000 |
| Lead time (days, PO → DDP) | 14 | 21 | 52 | 12 |
| Payment terms | Net 45 | Net 30 (10% deposit) | T/T 30/70 | Net 60 |
| Certifications | ISO 9001, FSC, Sedex | ISO 9001, FSC | ISO 9001 | ISO 9001, ISO 14001, FSC |
| Incoterm (original quote) | FCA Poznań → renegotiated DDP | FCA Bursa → added ~€0.04/unit for DDP | FOB Qingdao → added ~€0.08/unit for DDP | DDP quoted directly |
| Sample | Yes — free, 50 units | Yes — paid €120 refundable | Yes — free shipped (3-week transit) | Yes — free, 20 units |
| Notes | Existing vendor in plastics category, known commercial lead. Tooling dies already own. Proposed a 2-year fixed-price agreement with CPI-link. | Lira volatility priced into quote — fixed EUR exchange. Strong print quality samples. MOQ at the edge of our monthly draw. | Red Sea re-routing is standard 2024+. Lowest unit price but hidden €0.04/unit CBAM exposure on kraft liner from 2026 Q3. | Premium unit price but shortest lead time and best ESG doc pack. Good fit as a contingency source but not primary. |

### Scoring (1-5 scale)

| Supplier | Score Price | Score Quality | Score Lead Time | Score Terms | Weighted total |
|---|---|---|---|---|---|
| Kartpol (PL) | 3 | 4 | 4 | 4 | **70.0** |
| BursaKraft (TR) | 4 | 3 | 3 | 3 | **69.0** |
| Qingdao Huabang (CN) | 5 | 2 | 1 | 2 | **63.0** |
| Embalpack (PT) | 2 | 5 | 5 | 4 | **70.0** |

**Math shown for Kartpol:** (3 × 50 + 4 × 20 + 4 × 20 + 4 × 10) / 5 × 5 = (150 + 80 + 80 + 40) / 5 × 5 = 350 / 5 = 70.0 ✔

### Why Kartpol won despite a higher unit price than BursaKraft and a much higher unit price than Qingdao

The tie between Kartpol (70.0) and Embalpack (70.0) was broken in favour of Kartpol because Kartpol already owned the cutting dies (zero tooling re-investment) and the 2-year CPI-linked agreement de-risked the price column for the CFO. Qingdao's €0.29 unit price looks decisive until you add: €0.04/unit hidden CBAM exposure (2026 Q3+), an effective 52-day lead time that requires 1.4× safety stock vs. the 14-day PL option, plus the cash-flow drag of T/T 30/70 against Kartpol's Net 45. The landed-cost gap collapses from 31% to roughly 6% once those are loaded in — and at 6% the continuity benefit of a 14-day PL supplier is the deciding factor.

### Hidden-cost stack for the CN option (why the €0.29 is a mirage)

| Cost element | Per-unit impact | Notes |
|---|---|---|
| Headline quote (FOB Shenzhen) | €0.29 | The number on the cover email. |
| Sea freight + Red Sea surcharge | +€0.046 | Mid-2026 spot averaged 15-25% above pre-2024 baseline. |
| Customs clearance + duty (3.5%) | +€0.011 | Varies by HS code; run an ATLAS or TARIC query per SKU. |
| CBAM exposure (2026 Q3+, kraft input) | +€0.040 | Estimated based on EU CBAM phase-in schedule. |
| FX buffer (CNY exposure, 90-day quote) | +€0.008 | ~3% buffer applied to currency-denominated portion. |
| Safety stock carrying cost (52-day lead) | +€0.015 | At 8% WACC, 38 extra days of inventory × unit cost. |
| T/T 30/70 cash-flow cost vs. Net 45 | +€0.006 | ~0.66% per 30 days × WACC adjustment. |
| **Landed true unit cost** | **≈ €0.376** | Within 10% of Kartpol's €0.42 FCA Poznań DDP. |

Once the stack is visible, the commercial conversation shifts from "why are we paying 45% more for Poland" to "why are we paying 10% more for 38 extra days of lead time and a regulatory tail we can't price." The Notes column is where that stack gets written down.

---

\newpage

## Example 2 — Strategic: contract electronics manufacturing (PCBA + box-build, 12,000 units/yr)

**Scenario:** Polish industrial IoT company migrating from a Taiwanese CM after a 2024 quality incident. Product: industrial gateway with 4-layer PCB, custom enclosure, functional test + box-build. Annual volume: 12,000 units. RFQ sent to 3 CMs in Poland, Turkey, Portugal. Engineering lead + procurement lead + quality lead scored together.

**Weights applied (strategic archetype):** Price 25 / Quality 35 / Lead Time 20 / Terms 20

### Filled comparison table

| Field | Elmark EMS (PL) | ContEMS Istanbul (TR) | Inovaflex Porto (PT) |
|---|---|---|---|
| Legal entity | Elmark Sp. z o.o. | ContEMS Elektronik A.S. | Inovaflex Electrónica Lda. |
| Country of production | Poland (Łódź) | Turkey (Istanbul, Tuzla) | Portugal (Porto) |
| Unit price range (EUR, EXW — box-build complete) | €142-158 (vol-tiered) | €128-140 | €154-172 |
| NRE tooling & setup (one-time) | €24,000 | €18,500 | €32,000 |
| MOQ (units per PO) | 500 | 1,000 | 250 |
| Lead time (days, first article → serial ramp) | 45 first article / 28 serial | 55 first article / 35 serial | 40 first article / 21 serial |
| Payment terms | Net 45, 30% milestone on NRE | Net 30 + 40% NRE prepay | Net 60, 20% NRE prepay |
| Certifications | ISO 9001, ISO 14001, IPC-A-610 Class 2, IPC-J-STD-001 | ISO 9001, IPC-A-610 Class 2 | ISO 9001, ISO 13485 (ready for medical pivot), IPC-A-610 Class 2, ISO 14001, AS9100 (aerospace) |
| Incoterm | FCA Łódź | FCA Istanbul | FCA Porto |
| Sample / first-article | Yes — 5 units at cost, included in NRE | Yes — 3 units, buyer pays €420 each | Yes — 2 units included |
| Component sourcing | Allocation support on STM32 & TI parts, established Avnet relationship | Spot market only, no allocation | Dual-source strategy with Arrow + Farnell, managed BOM |
| Notes | Plant is 2.5hr drive from our R&D. Hands-on design-for-manufacturing reviews. One-shift capacity, second shift on-demand. ROHS/REACH + conflict-minerals signed. | Lowest unit price but buyer manages BOM. Currency clause demanded EUR-pegged pricing. No allocation = risk on microcontroller shortages. Shortlist-ready but flagged. | Highest unit price but medical-grade QMS, managed BOM, shortest serial lead time. Strong fit if product evolves toward regulated verticals in year 2-3. |

### Scoring (1-5 scale), with weighted math shown

**Formula:** `(Price × 25 + Quality × 35 + Lead × 20 + Terms × 20) / 5`

| Supplier | Price (1-5) | Quality (1-5) | Lead (1-5) | Terms (1-5) | Price × 25 | Quality × 35 | Lead × 20 | Terms × 20 | Sum | ÷ 5 | Weighted |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Elmark (PL) | 3 | 4 | 4 | 4 | 75 | 140 | 80 | 80 | 375 | 75 | **75.0** |
| ContEMS (TR) | 5 | 3 | 3 | 3 | 125 | 105 | 60 | 60 | 350 | 70 | **70.0** |
| Inovaflex (PT) | 2 | 5 | 5 | 3 | 50 | 175 | 100 | 60 | 385 | 77 | **77.0** |

Inovaflex wins on the strategic weighting despite being the most expensive quote by unit price *and* the most expensive on NRE.

### 3-year TCO comparison (what the CFO asked for)

The decision meeting turned on a 3-year TCO spreadsheet the procurement lead built over a weekend. Abbreviated form below.

| Cost element (3-year cumulative, 36,000 units total) | Elmark (PL) | ContEMS (TR) | Inovaflex (PT) |
|---|---|---|---|
| NRE tooling + setup | €24,000 | €18,500 | €32,000 |
| Unit cost (3yr × 12k × mid-range) | €5,400,000 | €4,830,000 | €5,868,000 |
| Expected component-variance cost (spot market exposure) | €85,000 (managed) | €325,000 (spot) | €65,000 (managed) |
| First-article + serial qualification labour (buyer-side) | €38,000 | €42,000 | €28,000 |
| Safety stock carrying cost (longer TR lead) | €52,000 | €96,000 | €41,000 |
| Re-qualification cost if supplier fails year 2 | €0 (managed) | ~€180,000 risk-adj | €0 (managed) |
| **3-year TCO** | **€5,599,000** | **€5,491,500 + €180k risk** | **€6,034,000** |

On raw TCO Inovaflex still looks like the most expensive option by ~€400k over three years. Two things tipped the decision: (1) the risk-adjusted ContEMS number collapses the gap to ~€360k if the re-qualification scenario fires, and (2) the ISO 13485 optionality was worth an estimated €250-400k in avoided re-qualification cost if the product pivots to regulated markets in year 2-3. On a risk-adjusted basis, Inovaflex effectively priced at parity with Elmark and below the risk-adjusted ContEMS number.

### Why Inovaflex won despite +13% unit price and +33% NRE vs. ContEMS

The decision turned on managed BOM and IPC-ISO-13485-AS9100 stack. ContEMS's €128 unit price is real, but with spot-market component sourcing and no allocation support, the realised landed cost fluctuated 9-18% across the 2022-2024 microcontroller crisis for other buyers we surveyed. Inovaflex's managed BOM absorbs that variance and lets the customer forecast landed cost within ±2%. Second driver: the ISO 13485 certification gives the customer an option to pivot into medical IoT in year 2 without re-qualifying a new CM — a €200-400k saved re-onboarding cost if the product roadmap goes that direction. Inovaflex's price premium is effectively the price of optionality, and in a strategic category optionality is what you're buying.

---

\newpage

## Example 3 — Regulated: medical device component (Class IIa sterile single-use part)

**Scenario:** German medical device OEM sourcing a moulded polymer component for a Class IIa device sold in the EU under MDR and in the US under 510(k). Volume: 180,000 units/yr, multi-year. Three suppliers invited — two EU, one with dual US/EU operation. Quality and regulatory leads joined the scoring meeting; procurement had a veto on commercial terms only.

**Weights applied (regulated archetype):** Price 20 / Quality 45 / Lead Time 20 / Terms 15

### Filled comparison table

| Field | MedPolymer GmbH (DE) | SteriMold Polska (PL) | IrelandMed Ltd. (IE, FDA-registered plant) |
|---|---|---|---|
| Legal entity | MedPolymer GmbH | SteriMold Polska Sp. z o.o. | IrelandMed Ltd. |
| Country of production | Germany (Freiburg) | Poland (Gliwice) | Ireland (Galway) + US satellite (NJ) |
| Unit price (EUR, DDP Munich) | €2.85 | €2.12 | €3.40 |
| MOQ | 10,000 | 25,000 | 5,000 |
| Lead time (days, validated process) | 35 | 45 | 28 |
| Payment terms | Net 60 | Net 45 | Net 45 |
| Certifications | ISO 9001, ISO 13485, ISO 14971, MDR Notified Body audit passed 2025 Q2 | ISO 9001, ISO 13485 (awaiting 2026 Q2 renewal) | ISO 9001, ISO 13485, ISO 14971, FDA 21 CFR 820 registered, EU MDR compliant, Health Canada MDSAP |
| Incoterm | DDP Munich | DDP Munich | DDP Munich |
| Sample / DHF package | Full DHF + validated IQ/OQ/PQ | DHF in progress, IQ only completed | Full DHF, IQ/OQ/PQ, process validation, MDSAP audit reports on-demand |
| Biocompat data (ISO 10993) | Cytotoxicity + sensitization + irritation on file | Cytotoxicity only — gap | Full ISO 10993-1 panel (cytotox, sensitization, irritation, systemic tox, genotox) |
| Change control (notification timeline for material/process) | 90-day buyer notice | 60-day notice, less structured | 180-day notice with formal change-impact assessment |
| Notes | Established supplier in the regulated space. Full DHF. Premium price reflects MDR audit overhead. | Price leader but ISO 13485 expiring; biocompat gap is a regulatory red flag unless buyer funds the missing ISO 10993 studies (~€80k). | Highest price but only supplier covering both EU MDR and US FDA without a second qualification cycle. MDSAP means shared audit across DE/CA/US/JP/AU. |

### Scoring (1-5 scale)

| Supplier | Price × 20 | Quality × 45 | Lead × 20 | Terms × 15 | Sum | ÷ 5 | Weighted |
|---|---|---|---|---|---|---|---|
| MedPolymer (DE) | 60 (score 3) | 180 (score 4) | 60 (score 3) | 60 (score 4) | 360 | 72 | **72.0** |
| SteriMold (PL) | 100 (score 5) | 90 (score 2) | 40 (score 2) | 45 (score 3) | 275 | 55 | **55.0** |
| IrelandMed (IE) | 40 (score 2) | 225 (score 5) | 100 (score 5) | 45 (score 3) | 410 | 82 | **82.0** |

### Why IrelandMed won despite +60% unit price vs. SteriMold

The regulated archetype weights quality at 45% and price at 20% — and that reflects the actual economics of a Class IIa MDR device. If SteriMold's ISO 13485 renewal slips by a quarter (it is already in 2026 Q2, right at the edge of the audit calendar) the buyer faces either a supply interruption or a non-conforming product risk. The missing ISO 10993 biocompat studies are an €80k out-of-pocket plus a 6-month delay — a hidden cost not visible in the €2.12 headline. IrelandMed's MDSAP coverage is the hidden winner: one audit covers EU + US + Canada + Japan + Australia, which means the buyer can expand commercialisation to three additional markets without re-qualifying the supplier. That option alone is worth €150-300k in avoided qualification cost, which more than recovers the +€0.55/unit premium across the first two years of volume. In a regulated category the price column is always a trap — the total cost of compliance is what you're actually scoring.

### Regulated-category red flags the quote didn't surface

Things the RFQ quote did not mention but showed up during the deep qualification conversation. Each of these would kill the SteriMold line even if the price were €1.80.

- **Missing biocompat panel**: cytotoxicity only. Systemic toxicity + genotoxicity + sensitization missing — required per ISO 10993-1 for a Class IIa sterile single-use part in skin/mucosa contact. Estimated cost to complete: €60-90k + 5-7 months.
- **No formal change-control process documented**: material or process changes would be communicated "as and when" — unacceptable for an MDR product. Buyer would be unable to file a timely change notification with their Notified Body.
- **ISO 13485 certificate expires before the expected first PO ships**: renewal audit outcome unknown at quote stage. Even a 30-day slip cascades into a 90-day product launch delay.
- **No MDSAP, no FDA registration**: locks the buyer into EU-only commercialization for this SKU. An expansion decision 18 months later triggers a full re-qualification cycle.
- **Sterilization process ownership unclear**: is SteriMold doing it in-house or subcontracting? If subcontracting, the subcontractor needs to be on the buyer's supplier list too. Undocumented.

In the regulated archetype, the cost of a supplier failure isn't "bad quarter" — it's product recall and CAPA. The weight model has to reflect that, and the Notes column has to capture it.

---

\newpage

# 3. Ten things suppliers always omit from quotes

These are the line items we see stripped out of 80%+ of quotes in the mid-market cohort. Ask for each one in writing before you sign. Silence in a quote is not absence of cost; it is the cost moving onto the invoice.

1. **Pallet, crate, and packaging fees** — a "€0.42 per box" quote turns into €0.46 once the export crate, pallet, and stretch-wrap land on the invoice at €18-40 per pallet depending on origin.
2. **Tooling amortization status** — if the tooling was built by a prior customer, the supplier may be spreading legacy cost across all buyers; if built for you, you own the residual and need the IP clause to match.
3. **Sample costs (destructive vs. non-destructive)** — free samples usually means non-destructive; any destructive testing (pull-test, burst-test, biocompat) is billed separately and often at a premium.
4. **EXW vs. FCA vs. DDP delta** — EXW means the supplier brings the crate to their warehouse door and stops; FCA includes forklift-loading onto the carrier; DDP includes export clearance, freight, import duty, destination delivery. The swing between EXW and DDP can exceed 12% of unit price.
5. **Customs clearance and broker fees at destination** — a DAP quote stops at the destination port; the €90-180 per shipment customs brokerage is invoiced later and nobody lists it in the quote.
6. **FX movement clauses and quote validity windows** — a quote in TRY or CNY priced on a 90-day validity with no FX hedge is a quote that will move 3-8% by the time you raise a PO.
7. **Minimum annual volume commitments (MAVCs) and rebate claw-backs** — the rebate structure that made the unit price attractive often comes with a MAVC, and falling under the MAVC retroactively converts the rebate into a debit memo.
8. **Setup, changeover, and colour-change fees** — per-SKU setup charges ranging €150-2,500 per changeover are often absorbed into the unit price assumption of a single-SKU PO; real multi-SKU orders trigger separate setup lines.
9. **Test, inspection, and certificate-of-conformance fees** — a Certificate of Conformance is €0 if verbal; a signed COC with material traceability, lot numbers, and test-report PDFs is €15-120 per lot in the regulated categories.
10. **Storage, demurrage, and warehousing charges for extended lead time** — if your order slips or arrives early, the 30-day free warehousing at the port or forwarder's facility expires and €15-45/day/pallet demurrage starts; nobody shows this in the quote until the invoice.

## "What to ask instead" — turn each omission into a quote clarification

Don't settle for the headline quote. Send the supplier a single clarification email with the items below. Suppliers that respond in detail are signalling operational maturity; suppliers that hedge or go silent are signalling a different kind of information.

| Hidden line | What to ask in writing |
|---|---|
| Packaging / pallet | "Please itemize packaging, pallet, crate, stretch-wrap, and any export packaging charges per unit or per pallet. Include inner packaging if applicable." |
| Tooling amortization | "Please confirm tooling ownership: is tooling already in production, who owns it, and what is the buyout cost if we choose to transfer? Please state the amortization schedule embedded in the unit price." |
| Sample cost detail | "Please confirm: sample cost, quantity, whether destructive testing is included, and whether sample cost is refundable against first PO." |
| Incoterm normalization | "Please requote at DDP [our DC address] so we can compare to peer quotes received at DDP. If DDP is not feasible, please itemize the additional cost line items we would need to budget separately." |
| Customs broker / clearance | "For DAP quotes: please itemize or estimate customs clearance and import duty at destination. Please state the HS code you're using for customs classification." |
| FX / currency | "Please confirm currency, spot rate used, quote validity date, and whether you can hold this quote in EUR for [90/120] days. If not, please state the FX clause." |
| Rebate / MAVC | "Please itemize any volume-tier pricing, rebate structure, and minimum annual volume commitment. Include the claw-back mechanism if MAVC is not met." |
| Setup / changeover | "Please state per-SKU setup charge, colour-change charge, and the minimum run length that makes the setup charge economically viable per SKU." |
| Test / COC | "Please state whether a signed Certificate of Conformance (with material traceability + lot numbers + test data) is included in the unit price, or whether it's an optional paid service. If paid, please state the cost per lot." |
| Storage / demurrage | "Please confirm free warehousing window at port / forwarder facility and the per-day demurrage rate after expiry. Also confirm late-delivery penalty structure if we're the cause of delay." |

Send this as a single email with a line item per clarification. Expect a response in 3-5 business days. Any supplier who takes longer than 7 business days to respond to 10 yes/no questions is telegraphing their operational capacity.

---

\newpage

# 4. How to fill the Notes column — micro-guide

The Notes column is the single most-read field in the RFQ sheet. Three months after award, nobody re-reads the MOQ number; everybody re-reads the Notes. Audit reads the Notes. The incoming category manager reads the Notes. Keep them sharp.

**Bad notes (delete these):**
- "Seems expensive."
- "Nice supplier."
- "Waiting on feedback."
- "CEO was helpful on the call."

**Good notes (ship these):**

- **Cite specifics with line references.** "Pallet cost €18/unit extra on invoice, NOT in quote — check line 47 of their email dated 2026-03-14." That's a defensible note. "They charge extra for pallets" is not.
- **Name the person and the commitment.** "Marek Kowalski (Commercial Director) committed to 14-day lead time in writing on 2026-03-18. Screenshot archived in `/qualify/Kartpol/`." Names make commitments real; anonymous assertions don't.
- **Quantify the risk, not the vibe.** "Lira volatility risk ≈ 4-6% price slip over 90 days at current TRY trend; BursaKraft refused EUR-peg clause on call 2026-03-20." Quantify or cut.
- **Flag regulatory or cert expiry dates explicitly.** "ISO 13485 expires 2026-08; renewal audit scheduled 2026-06. If renewal slips, supply risk from 2026-09." Dates save you from surprises.
- **Capture tooling and IP ownership state.** "Tooling built by prior customer in 2022, supplier claims unrestricted use; IP clause to be confirmed by Legal before PO." Tooling ownership is a hidden landmine.
- **Record the competitive positioning you observed.** "Ranked #2 on price but #1 on lead time. Willing to match Kartpol's €0.42 if awarded 70%+ volume share. Email dated 2026-03-22." Future-you needs this when you renegotiate.
- **Link to the evidence pack.** "Audit report PDF: `/qualify/MedPolymer/audit-2025Q2.pdf`. Certificate scans in same folder." A note without evidence is a rumor.
- **Separate opinions from facts with a prefix.** Lead facts with the source: "Per KPMG supplier audit report 2025: ... ". Lead opinions with "I think": "I think their commercial team is under-resourced — they missed two follow-up emails." The reader can discount the opinions if they want to; they can't if you blur the line.

## Notes column — copy-paste scenarios

The following are battle-tested Notes column entries that are specific enough to be useful but abstract enough to adapt. Rip off the pattern.

**Scenario: strong commercial but weak quality evidence.**

> "Commercial lead (Maria Ledwon, Head of Sales) responsive within 4 hours on three separate emails. Quality evidence weaker: ISO 9001 renewal in 2025 Q4 confirmed via issuing body [TUV Rheinland DB lookup 2026-03-22]; requested 2024 CAPA/PPAP history — supplier declined, cited customer confidentiality. Gap flagged. Recommend Quality band 3, not 4, until factory audit completed."

**Scenario: price leader but commercial red flag.**

> "Lowest quote by 11%. However: (1) quote validity only 21 days, (2) 50% prepay required on first PO, (3) no EUR-peg offered — TRY exposure. Commercial director stopped responding to follow-up questions after day 4. Shortlist: NO. Evidence: email chain dated 2026-03-15 to 2026-03-25 in /qualify/[supplier]/."

**Scenario: incumbent suspected of sandbagging the price.**

> "Existing supplier. First-pass quote at €12.90, which is 6% above their current 2025 contract price (€12.15). After we sent clarification and named three alternative suppliers invited, their revised quote dropped to €12.05 in 48 hours. Flag: possible sandbag on first pass. Recommend keeping in shortlist but applying +1 caution to Terms score on the next RFQ."

**Scenario: capacity concern surfaced in factory call.**

> "Factory call 2026-04-02 with plant manager (Piotr Ziemba). Plant currently running 2 shifts at 82% utilization. Adding our annual volume (180k units) would push to ~95% without a third shift. Third shift is technically feasible but requires 90-day hiring ramp. Risk: 2026 Q4 volumes may be tight. Discussed Monday through the Joint Business Plan structure. Action: formalize capacity-commit letter before PO."

**Scenario: supplier referenced by existing customer.**

> "Referred by [named existing vendor] who has been purchasing from this supplier 3+ years. Verbal reference call 2026-04-05 with [named contact at referring vendor]: reliability good, quality consistent, commercial flexibility average. Reference notes filed in /qualify/[supplier]/reference-call-2026-04-05.md. This is the primary reason Quality scored 4 vs. 3 on sparse docs."

**Scenario: certification ambiguity.**

> "Supplier quote claims 'ISO 9001 certified'. Certificate PDF shows ISO 9001:2015 issued by [issuing body], expires 2027-09-30, scope covers 'design, manufacture, and sale of [product]' — scope correctly includes our category. Verified 2026-03-28 via issuing body's online certificate registry. Screenshot archived."

**Scenario: hidden line item discovered after the fact.**

> "Post-quote clarification email 2026-03-29 revealed: €18/pallet export-crate fee not in original quote. Applied to quote as +€0.024/unit (750 units/pallet). Revised landed cost: €0.444 (was €0.42). Updated Price column accordingly. Supplier confirmed fee is fixed; not negotiable except at volume >1M units."

Write these as if you are writing to a procurement manager who has to defend the decision in 6 months without access to you. Every note should be legible without back-channel context.

---

\newpage

# 5. Weighted scoring — worked math with a weight swap

Take the commodity packaging example (Example 1) and apply two different weight schemes to the same raw scores. This is the single most useful exercise for a new category manager; it shows how weighting — not the scores themselves — determines the winner.

## Raw 1-5 scores (unchanged)

| Supplier | Price | Quality | Lead Time | Terms |
|---|---|---|---|---|
| Kartpol (PL) | 3 | 4 | 4 | 4 |
| BursaKraft (TR) | 4 | 3 | 3 | 3 |
| Qingdao Huabang (CN) | 5 | 2 | 1 | 2 |
| Embalpack (PT) | 2 | 5 | 5 | 4 |

## Scheme A — commodity weights (50/20/20/10)

**Formula:** `(Price × 50 + Quality × 20 + Lead × 20 + Terms × 10) / 5`

| Supplier | Price × 50 | Quality × 20 | Lead × 20 | Terms × 10 | Sum | ÷ 5 | Weighted |
|---|---|---|---|---|---|---|---|
| Kartpol (PL) | 150 | 80 | 80 | 40 | 350 | 70 | **70.0** |
| BursaKraft (TR) | 200 | 60 | 60 | 30 | 350 | 70 | **70.0** |
| Qingdao Huabang (CN) | 250 | 40 | 20 | 20 | 330 | 66 | **66.0** |
| Embalpack (PT) | 100 | 100 | 100 | 40 | 340 | 68 | **68.0** |

**Result under commodity weights:** Kartpol and BursaKraft tie at 70.0. Qingdao (lowest price) sits behind both at 66.0 despite a perfect 5/5 on price — because Lead Time (20%) and Quality (20%) combine to punish it. The tie-break goes to Kartpol per the reasoning in Example 1.

## Scheme B — strategic weights (25/35/20/20)

Now pretend the same raw scores apply to a *strategic* category — say this is a bespoke printed retail display rather than a commodity box. Same suppliers, same scores, different weights.

**Formula:** `(Price × 25 + Quality × 35 + Lead × 20 + Terms × 20) / 5`

| Supplier | Price × 25 | Quality × 35 | Lead × 20 | Terms × 20 | Sum | ÷ 5 | Weighted |
|---|---|---|---|---|---|---|---|
| Kartpol (PL) | 75 | 140 | 80 | 80 | 375 | 75 | **75.0** |
| BursaKraft (TR) | 100 | 105 | 60 | 60 | 325 | 65 | **65.0** |
| Qingdao Huabang (CN) | 125 | 70 | 20 | 40 | 255 | 51 | **51.0** |
| Embalpack (PT) | 50 | 175 | 100 | 80 | 405 | 81 | **81.0** |

**Result under strategic weights:** Embalpack (PT) wins cleanly at 81.0 — the highest Quality and Lead Time scores now dominate because Price contribution dropped from 50% to 25%. Kartpol slips to #2. Qingdao falls off the shortlist entirely.

## Scheme C — regulated weights (20/45/20/15)

Now the same raw scores under regulated weights — a Class IIa medical printed insert, say.

**Formula:** `(Price × 20 + Quality × 45 + Lead × 20 + Terms × 15) / 5`

| Supplier | Price × 20 | Quality × 45 | Lead × 20 | Terms × 15 | Sum | ÷ 5 | Weighted |
|---|---|---|---|---|---|---|---|
| Kartpol (PL) | 60 | 180 | 80 | 60 | 380 | 76 | **76.0** |
| BursaKraft (TR) | 80 | 135 | 60 | 45 | 320 | 64 | **64.0** |
| Qingdao Huabang (CN) | 100 | 90 | 20 | 30 | 240 | 48 | **48.0** |
| Embalpack (PT) | 40 | 225 | 100 | 60 | 425 | 85 | **85.0** |

**Result under regulated weights:** Embalpack pulls further ahead (85.0 vs. 76.0 in Kartpol), and Qingdao falls to a score that would be auto-excluded in most teams' shortlist thresholds. The quality weight of 45% compounds Embalpack's ISO 14001 advantage and punishes Qingdao's single-cert posture.

## Side-by-side: same scores, three weight schemes, three different winners

| Supplier | Commodity (50/20/20/10) | Strategic (25/35/20/20) | Regulated (20/45/20/15) |
|---|---|---|---|
| Kartpol (PL) | 70.0 (tied #1) | 75.0 (#2) | 76.0 (#2) |
| BursaKraft (TR) | 70.0 (tied #1) | 65.0 (#3) | 64.0 (#3) |
| Qingdao Huabang (CN) | 66.0 (#3) | 51.0 (#4) | 48.0 (#4) |
| Embalpack (PT) | 68.0 (#2) | 81.0 (#1) | 85.0 (#1) |

The matrix above is the single clearest demonstration of why weight selection is upstream of scoring. Same four suppliers, same four score patterns, three different winners. A buyer who didn't declare weights in advance could engineer any of the three outcomes retroactively. That's why version-locking the weights before quotes arrive is non-negotiable.

## The lesson — weights decide the winner, not scores

The raw scores didn't change between Scheme A and Scheme B. Only the weights moved. The winner went from Kartpol (commodity) to Embalpack (strategic), and Qingdao went from "almost shortlisted" to "not competitive."

Two takeaways:

1. **If you don't version-lock weights before quotes arrive, you can engineer the winner retroactively.** This is exactly why Internal Audit asks "when were the weights set and by whom?" as the first question in a procurement review.
2. **Weight selection is a strategic decision, not a tactical one.** It reflects whether you're buying a commodity or buying optionality, and the CFO should see it before the RFQ goes out — not after.

---

\newpage

# 6. Calibration rules before you start scoring

Three calibration rules that prevent the most common scoring failures. Do these before the scoring meeting, not during it.

**Rule 1 — Score Price off a normalized Total-Cost-to-Buyer number, not off the quote headline.**

Price normalization is: `headline price + packaging + freight + duty + FX buffer + amortized tooling`. If you score off headline price, you reward suppliers who stripped packaging and freight out of the quote. Build a Price Normalization Tab in the spreadsheet with one row per supplier and a formula that shows landed cost to your DC; score 1-5 off the landed number.

**Rule 2 — Score Quality from documentary evidence, not from impressions.**

Quality 1-5 bands, calibrated:

- **5** = ISO + category-specific cert (IATF / AS9100 / ISO 13485) + buyer or third-party audit report within 18 months + ≥3 reference customers same category
- **4** = ISO + category-specific cert + reference customers, audit older than 18 months
- **3** = ISO only + references + no audit
- **2** = ISO only, no audit, no category-specific cert
- **1** = no documented cert + unwilling to share evidence

Write these bands on the whiteboard before scoring. Force the scorer to name the band before the number.

**Rule 3 — Score Lead Time as a reliability-adjusted number, not as a calendar number.**

A 21-day lead time with 85% on-time delivery history is functionally a 28-day lead time. Score the reliability-adjusted number. If you don't have reliability data for a new supplier, ask them for their last 12 months of OTD% with another customer (in writing, anonymized). Suppliers with nothing to show usually score below 70%.

Reliability-adjusted lead time = `calendar lead time / OTD%`. A 28-day calendar lead time at 80% OTD = 35-day reliability-adjusted. Score that.

**How to score Terms (the column most buyers fudge).**

Terms is rarely scored well because buyers conflate it with price. Payment terms and Incoterm flexibility are operational signals — separate them from price.

Terms 1-5 bands, calibrated:

- **5** = Net 60 / Net 75, no deposit, EUR-peg guaranteed 120+ days, DDP quoted or available on request, change-notice protocol defined
- **4** = Net 45, 0-20% deposit, EUR-peg 60-90 days, DDP or DAP available
- **3** = Net 30, 20-30% deposit, spot-FX clause, FCA only
- **2** = Net 30 with 40-50% prepay, no FX clause, EXW only
- **1** = 100% prepay required, letter of credit only, no FX protection, EXW

Note that Terms is partially a proxy for supplier cash flow. A supplier asking for 50% prepay on a first PO is usually cash-constrained — that's useful information about their operational resilience, not just their commercial preferences.

**Rule 4 — Have two scorers, not one. Reconcile before the decision meeting.**

Blind double-scoring is the single cheapest way to avoid the "strong personality dominates the number" failure. Two analysts score Quality and Lead Time independently. If their scores differ by more than 1.5 points, they meet for 15 minutes and reconcile with evidence on the table. If they still disagree, the category director breaks the tie and the disagreement is documented in the Notes column.

**Rule 5 — Write the decision rationale in the Notes column of the winner. Before you send the award email.**

Two sentences minimum: "[Supplier] awarded over [#2 and #3] because [top-1 reason from the Quality / Lead Time / Terms columns] despite [the unit price gap]. Weighted score [X] vs. [Y] under [archetype] weights, version-locked [date]."

Example (from the packaging RFQ): "Kartpol awarded over BursaKraft and Qingdao because owned tooling and 14-day lead time outweigh BursaKraft's 9% unit price advantage under commodity weights. Weighted tie at 70.0 resolved by tooling-ownership and 2-yr CPI-linked agreement. Weights locked 2026-03-08 by Commercial Director."

That is your audit-defence one-liner. It takes 90 seconds to write. Write it before the award goes out.

---

\newpage

# 7. Country-by-country normalization cheat sheet

A supplier's origin country changes the pre-scoring adjustments you must apply. Use this table as a quick reference when you load the RFQ spreadsheet.

| Origin | Currency to watch | Typical FX buffer | Incoterm quirks | Lead-time to W. Europe | Duty / CBAM exposure | Cert note |
|---|---|---|---|---|---|---|
| **Poland** | EUR (most suppliers price in EUR) or PLN | 0-2% | FCA Gdansk/Gdynia or DDP | 2-4 days road | None (EU) | ISO 9001 adoption near-universal; check issuing body |
| **Germany** | EUR | 0% | DDP commonly quoted | 1-3 days road | None (EU) | Premium cert stack expected; audit trail strong |
| **Turkey** | EUR-pegged quote if you ask; TRY if you don't | 3-6% if quoted in TRY | FCA Istanbul or Mersin; DDP available but added cost | 6-8 days road via Bulgaria | Duty: 0-3.8% (EU CU); CBAM: yes, non-EU | Certs strong but some issuing bodies are regional — verify |
| **Portugal** | EUR | 0-2% | DDP quoted directly; road freight well-priced | 4-6 days road | None (EU) | ISO 9001 + sectoral certs strong; growing regulated capacity |
| **Romania / Hungary / Czechia** | EUR for export quotes (preferred); RON / HUF / CZK otherwise | 2-4% if non-EUR | FCA origin common; DDP negotiable | 2-5 days road | None (EU) | Cert maturity improving; verify against issuing body DB |
| **China** | USD (typical) or CNY | 3-5% | FOB port (Shenzhen/Qingdao/Ningbo) standard; DDP rare and loaded | 42-55 days sea | Duty varies 2-12% by HS code; CBAM on iron/steel/aluminium phased 2026-2028 | ISO 9001 common; audit cadence weaker; verify issuing body |
| **India** | USD or INR | 3-5% | FOB Mumbai/Chennai; DAP negotiated | 30-45 days sea | Duty 0-12%; CBAM exposure growing | ISO certs broadly held; IATF / ISO 13485 less common |
| **Mexico** | USD | 1-3% | FCA / DDP common for NAFTA-region buyers | 5-10 days (trans-Atlantic) or truck to US | Duty: USMCA rules if US-bound; EU buyers face 3-6% | IATF strong in automotive belt (Querétaro/Puebla) |

**Two normalization actions to run on every quote, regardless of origin:**

1. **Convert the quoted currency to EUR at today's spot rate**, then apply the FX buffer from the table above. Annotate in the Notes column with the spot rate and the date.
2. **Normalize the Incoterm to DDP-buyer-DC** by adding freight, customs clearance, and destination delivery estimates. If the supplier won't quote DDP, build the adjustment yourself and note the line items used.

Suppliers who resist EUR-pegged quotes or DDP quotes are often signalling something about their cash flow or logistics capability. It's useful signal — capture it in the Notes.

---

\newpage

# 8. Five scoring pitfalls that kill defensibility

These are the five most common errors we see in procurement scoring sheets that fail audit. Each one can be prevented by a single discipline.

**Pitfall 1 — Moving weights after the scores are in.**

You score the first pass, supplier A wins by 2 points, your category director thinks supplier B was the better strategic choice, so you nudge the Quality weight from 25% to 30% and re-run. Supplier B now wins. This is auditable and indefensible. If the weights need to change after the first pass, you restart the scoring exercise with a new timestamp and a written justification.

**Discipline:** weights are committed in an email to the category director before the first quote arrives. Period.

**Pitfall 2 — Scoring a single supplier on "gut feel" to break a tie.**

Two suppliers score 72.0. The buyer knows supplier A personally and bumps their Quality score from 4 to 5 "because I've seen their factory." Score swings 1 point. Supplier A wins. This fails on two counts: the factory visit evidence should already be in the Quality band justification, and if it isn't, it's not evidence.

**Discipline:** tie-breaks are resolved by named criteria (tooling ownership, geographic proximity, contract-term length), and the tie-break criterion is declared before the scores are opened.

**Pitfall 3 — Scoring incomplete quotes against complete quotes.**

Supplier A gave you full data, supplier B didn't fill MOQ and lead time. You enter "TBC" in those fields and score supplier B generously because "they seem responsive." Never. The right move is to flag the row incomplete, send a follow-up email with a deadline, and exclude from scoring until complete. If the deadline passes, supplier B is out.

**Discipline:** missing fields = row incomplete = not scored. No exceptions.

**Pitfall 4 — Scoring price off the quote headline, not off normalized landed cost.**

The packaging example above shows why. Qingdao's €0.29 headline becomes €0.376 landed, and the "price winner" changes. If your Price column is the raw quote, you're scoring the wrong number.

**Discipline:** the Price column in the scoring sheet is the landed cost number, not the quote headline. Build a Normalization Tab with the workings.

**Pitfall 5 — No documented tie-break or secondary criterion.**

Two suppliers tie at 70.0. The buyer picks supplier A because "they're in the EU." Fine — but the EU-preference rule needs to be declared *before* scoring. If it wasn't, the tie-break is vulnerable to a challenge by the losing supplier and an audit review.

**Discipline:** declare secondary criteria (country-of-origin preferences, dual-source requirements, incumbent advantage) in the same version-locked email that declares the weights.

---

\newpage

# 9. When to disqualify a quote before scoring

Sometimes the right move is to take a quote out of the scoring pool entirely rather than score it low. Disqualification is a stronger signal than a low score, and it avoids the "why did the bad supplier even get on the list" question at audit.

Disqualify (don't score) if any of the following is true:

1. **No legal entity on the quote.** A quote on a gmail account with no company letterhead, no VAT ID, no address. You cannot raise a PO to that entity. Out.
2. **Sanctions-listed entity or beneficial owner.** Screen the legal entity and the UBO against OFAC SDN and EU sanctions lists before scoring. A hit is a hard exclusion.
3. **Missing category-mandatory certification.** If your category requires IATF 16949 (automotive), ISO 13485 (medical), AS9100 (aerospace), or a food-contact certification — suppliers without the cert do not qualify, regardless of price.
4. **Refuses to provide evidence of a claimed cert.** A supplier who claims ISO 9001 but won't send the certificate PDF or won't name the issuing body. You cannot verify, you cannot defend, you cannot award.
5. **Quote validity under 14 days.** A quote that expires faster than your decision cycle is not a quote — it's a negotiation opener. Either extend validity or drop the supplier.
6. **Payment terms that require >50% upfront for a first-time engagement.** A new supplier asking for 100% prepay is either cash-constrained, high-risk, or both. Negotiate down to a 30-50% milestone pattern or disqualify.
7. **Refuses sample for a category where physical inspection matters.** Commodity categories (standard fasteners, bulk raw materials) may legitimately waive samples. Custom or regulated categories — never.
8. **Commercial contact unreachable.** If you can't reach the commercial contact in the first 72 hours of the quote arriving, the supplier is signalling bandwidth problems. Two emails and a phone attempt, then flag.

Disqualification decisions go in the Notes column with the specific reason cited. Save the email or screenshot. If the supplier appeals, you have the paper trail.

---

\newpage

# 10. Negotiation after scoring — turning the score sheet into leverage

The scoring sheet is also a negotiation tool. Once you have a ranked shortlist, the gap between #1 and #2 is a negotiating position, not a final answer. Two concrete moves:

**Move 1 — The counter-brief.**

Send the #2 supplier a short email: "Your quote scored strongly on [Quality / Lead Time / Terms] but was 6-9% above the leading bid on landed unit cost. If you can bring the unit price to [specific number], we would revisit the ranking." Give them 72 hours.

About 40% of the time in our beta cohort, the #2 supplier comes back with a revised quote within the window. About 20% of the time, the #1 supplier gets wind of the conversation and sharpens their own number. About 40% of the time, no movement. In all three cases, you get information: either a better price, better insight into the #1's confidence, or confirmation that the #2 is walking away.

**Move 2 — The structural ask.**

If the price doesn't move on the counter-brief, shift the ask to terms. "We're prepared to award at your quoted price if you can extend Net 30 to Net 60 and include a 90-day EUR-peg clause." Terms improvements are often easier for the supplier to give than price — cash flow beats margin in many mid-market manufacturing companies.

Document both rounds of negotiation in the Notes column. "Round 1 counter-brief 2026-04-12: supplier held price, agreed to Net 45. Round 2 2026-04-15: supplier improved unit price by 3.2% on a 2-year contract commitment." That's the audit trail Internal Audit and the CFO both want.

**What not to do:**

- Don't start a bidding war between #1 and #2. You'll get a short-term price win and a long-term supplier relationship problem. Counter-briefs are one-shot, not iterative.
- Don't reveal the #1's price to the #2, even informally. That's legally exposed in some jurisdictions and ethically suspect in all of them. Describe the gap in percentage terms if at all.
- Don't negotiate on a score you haven't defended. If the #1 scored highest on Quality and the #2 is asking why, you need to be able to name the band criteria. If you can't, your scoring was vibes.

---

\newpage

# 11. Glossary — the acronyms you'll see in quotes

A quick reference for the abbreviations that appear in supplier quotes. Fluency here compresses the time-to-useful-question from 10 minutes to 30 seconds.

| Term | Meaning |
|---|---|
| **Incoterms 2020** | The standard set of trade terms defining responsibilities between buyer and seller. Updated every 10 years. |
| **EXW** (Ex Works) | Seller hands over the goods at their own premises. Buyer arranges everything else. |
| **FCA** (Free Carrier) | Seller delivers to a named carrier at a named place. Includes loading onto carrier. |
| **FOB** (Free On Board) | For sea freight only. Seller delivers to the named port and loads onto the vessel. |
| **CIF** (Cost, Insurance, Freight) | Sea freight. Seller pays ocean freight and insurance to the destination port. Buyer clears customs. |
| **DAP** (Delivered at Place) | Seller delivers to the named place in destination country. Buyer clears customs. |
| **DDP** (Delivered Duty Paid) | Seller delivers fully customs-cleared to buyer's door. Maximum responsibility on seller. |
| **MOQ** | Minimum Order Quantity. Usually per PO, sometimes per SKU. |
| **MAVC** | Minimum Annual Volume Commitment. The volume floor below which rebates or pricing tiers are forfeited. |
| **COC** | Certificate of Conformance. Document confirming goods match specification, usually with material traceability. |
| **DHF** | Design History File (medical device). Traceable record of design development. |
| **QMS** | Quality Management System. ISO 9001 / IATF 16949 / ISO 13485 / AS9100. |
| **IQ / OQ / PQ** | Installation / Operational / Performance Qualification — the three stages of process validation. |
| **NRE** | Non-Recurring Engineering. One-time tooling, setup, and engineering cost at project kickoff. |
| **CBAM** | Carbon Border Adjustment Mechanism — EU tariff on carbon-intensive imports, phased 2026-2028. |
| **CSRD** | Corporate Sustainability Reporting Directive — EU sustainability disclosure regime. |
| **CSDDD** | Corporate Sustainability Due Diligence Directive — EU supply-chain due-diligence regime, phased 2027-2029. |
| **OTD** | On-Time Delivery %. Share of POs delivered within the committed lead-time window. |
| **PPM** | Parts Per Million (defect rate). Industry standard for manufacturing quality. |
| **PPAP** | Production Part Approval Process — automotive-industry qualification procedure (IATF 16949 world). |
| **MDSAP** | Medical Device Single Audit Program — one audit covering EU, US, Canada, Japan, Australia. |
| **HS code** | Harmonized System classification — the 6-10 digit code that determines import duty. |
| **T/T** | Telegraphic Transfer. Wire payment method common in Asia trade. "T/T 30/70" = 30% on PO, 70% before shipment. |
| **L/C** | Letter of Credit. Bank-guaranteed payment instrument, common in first-time Asia trade. |
| **WACC** | Weighted Average Cost of Capital. The discount rate the CFO applies to cash-flow analysis. |

---

\newpage

# 12. Appendix — the 10-field comparison structure (recap)

The worked examples above all use the 10 base fields from the CSV template. If you need a refresher on what each field is and what to look out for, here they are compressed.

| # | Field | Watch for |
|---|---|---|
| 1 | Supplier Name (legal entity) | Trade name ≠ legal entity. Legal entity is what appears on the PO. |
| 2 | Country of production | Not country of sales office. Lead time and CBAM follow production, not admin. |
| 3 | Unit Price (EUR, normalized) | Normalize currency AND Incoterm before scoring. |
| 4 | MOQ (units) | €-MOQ is deceptive at low unit prices. Convert to unit count always. |
| 5 | Lead Time (days) | FCA/FOB is not DDP. Specify the endpoint. Apply OTD reliability discount. |
| 6 | Payment Terms | Net 60 vs Net 30 at 8% WACC ≈ 0.66% effective discount. Quantify. |
| 7 | Certifications | Name them. Certificate number + expiry + issuer. "Certified" is not. |
| 8 | Incoterm | Incoterms 2020. EXW to DDP swing can exceed 12% of unit price. |
| 9 | Sample availability | Paid / free / destructive / non-destructive matter separately. |
| 10 | Notes | See section 4. This is where audit defence lives. |

---

\newpage

# How Procurea fits

This template is free and standalone. It solves the late-stage comparison step — the 30 minutes of structured scoring that turns 5-20 quotes into a ranked shortlist.

The earlier stage — finding and qualifying the 100-250 nearshore suppliers worth inviting to the RFQ in the first place — is the 30+ hours of manual work most procurement teams quietly skip. That's the bottleneck Procurea was built to remove: multilingual supplier discovery in 26 languages, outbound verification, and auto-scored shortlisting delivered into a comparison view that looks a lot like this one.

If your comparison step is the problem, this spreadsheet is the answer. If you're comparing the same five suppliers every quarter because finding new ones is too expensive, the comparison step isn't the bottleneck and a better template won't help. That's the version of the problem Procurea solves.

See `procurea.io/features/offer-comparison` for the integrated sourcing + comparison view, or keep using this Excel — it works.

---

\newpage

# 13. RFQ cover-letter template — what to send with the request

Quote quality is a function of RFQ quality. A structured cover letter produces structured quotes; a vague email produces vague quotes. Paste the template below into your RFQ email and adapt per category.

```
Subject: RFQ — [Category / Part number] — Response requested by [date]

Dear [Supplier commercial contact],

We are seeking quotes for the supply of [category / part], with expected
annual volume of [X units] across [Y SKUs]. Your company was identified
through [referral / database / industry-press / previous contact], and
we would appreciate a formal quotation within [14 / 21] calendar days.

SCOPE
— Category: [brief description]
— Primary part number / specification: [link to spec sheet PDF]
— Expected annual volume: [X units]
— Expected PO cadence: [monthly / quarterly] releases

QUOTE STRUCTURE (please return in the same format)

Please provide a quotation containing the following information, in the
structure below, for each SKU or volume tier:

1. Supplier legal entity name and VAT ID
2. Country of production (not sales office)
3. Unit price in EUR
4. If EUR is not your quoting currency, please state the spot rate
   used and confirm EUR-peg availability for [90 / 120] days
5. MOQ in units (not in euros)
6. Standard lead time in days from PO confirmation to [FCA origin /
   DDP our DC]
7. Payment terms
8. Active certifications (ISO 9001, any category-specific: IATF /
   AS9100 / ISO 13485 / FSC / Sedex)
9. Incoterm (please quote DDP [our DC address] if feasible; if not,
   itemise the freight, customs, and destination delivery costs
   separately)
10. Sample availability (free / paid / destructive / non-destructive)
11. Tooling: is tooling included in NRE, owned by prior customer, or
    needs buyout? If buyout, please quote.
12. Line items not in the per-unit price: packaging, pallet, crate,
    testing, COC, setup / changeover fees
13. Volume-tier pricing and any rebate structure with MAVC terms

TIMELINE

— RFQ issued: [date]
— Clarification questions due from supplier: [date + 5]
— Final quote response: [date + 14 or 21]
— Shortlist decision: [date + 28]
— Award and PO: [date + 35]

If any information above is not available or requires clarification,
please reply by [clarification deadline]. Incomplete quotes will be
flagged for follow-up but not scored against complete quotes.

Please send your response to [procurement inbox] with a CC to
[category manager].

Thank you,
[Your name]
[Your role / Category]
[Company]
```

The template above gets you 80% of the structured data you need without a follow-up email. The remaining 20% is supplier-specific and gets collected in the clarification round.

**What this cover letter does:**

- Signals that the buyer is professional and will evaluate on process, not relationship only. Well-run suppliers respond better.
- Forces structured quote responses, which makes the comparison step trivial to populate.
- Establishes the timeline in writing, which lets you hold suppliers accountable if they miss the window.
- Documents the RFQ as a formal procurement process — useful for audit, useful for later renegotiation, useful if a supplier later claims they weren't given a fair chance.

**What this cover letter does not do:**

- It does not negotiate. Negotiation happens after scoring, not during quoting.
- It does not promise volume. Be honest about expected annual volume and PO cadence; suppliers price differently for firm commitment vs. forecast.
- It does not waive the right to reject all quotes. Always retain that right explicitly.

---

\newpage

# 14. Common supplier tactics and how to spot them

Suppliers negotiate for a living; most buyers run 40-80 RFQs per year and do not. The tactics below are not dishonest — they are rational supplier behaviour in an information-asymmetric market. Your job as the buyer is to recognise them.

**Tactic 1 — The loss-leader quote.**

The supplier quotes aggressively low on a first PO to win the relationship, fully intending to recover margin on change orders, rush fees, and volume tier slips. Common in contract manufacturing and tooling-heavy categories.

**How to spot:** quote is >15% below the next-cheapest quote with no obvious reason (no new factory, no excess capacity, no China-landed-cost difference). Ask the supplier directly why the quote is so low. A confident supplier will cite capacity, process, or strategic reasons; a loss-leader supplier will hedge.

**Counter:** negotiate a firm 2-year price-holding commitment with CPI link. If the supplier refuses, they were loss-leading.

**Tactic 2 — The cert-by-implication.**

The quote says "quality management certified" or "industry-standard compliant" without naming the cert. When pressed, the supplier says ISO 9001 — but the certificate is expired, lapsed, or issued by a non-accredited body.

**How to spot:** vague cert language in the quote. Ask for the certificate PDF, issuing body, certificate number, and expiry date. Verify on the issuing body's online database.

**Counter:** move the supplier to "pending" until certs are verified. Do not score until verified.

**Tactic 3 — The MOQ hostage.**

MOQ is set at a level that forces the buyer into a volume commitment they didn't plan. "Yes, €0.29/unit — if you take 250,000 units. Below that, price jumps to €0.38."

**How to spot:** MOQ is 3-5× higher than peer suppliers and the unit-price delta between tier 1 and tier 2 is suspiciously wide.

**Counter:** request a tiered price schedule showing tier 1 (your expected volume), tier 2 (50% below), and tier 3 (50% above). Suppliers with a genuine cost curve will share this; suppliers who are pricing strategically will hedge.

**Tactic 4 — The lead-time bait-and-switch.**

Quote says "21-day lead time." When you place the PO, the confirmation comes back as "28 days due to material availability." Then the first shipment slips another 7 days.

**How to spot:** supplier refuses to provide last-12-months OTD data or references on lead-time reliability.

**Counter:** make lead-time a contract term with a late-delivery penalty (1-2% per week late, capped at 10%). Suppliers confident in their schedule will accept; suppliers who were bait-and-switching will renegotiate upfront.

**Tactic 5 — The late quote from the preferred supplier.**

Your incumbent quotes two days after the deadline, after seeing the other quotes via the back-channel. Quote is conveniently 3-5% below the leader.

**How to spot:** incumbent is systematically late across quote rounds, and the incumbent's quote is suspiciously close to the leading price.

**Counter:** strict deadline discipline. Late quotes are not scored. If the incumbent is late twice, they lose preferred status. The behaviour usually corrects after one visible consequence.

**Tactic 6 — The bundled quote.**

Supplier quotes SKUs A, B, and C as a bundle. Unit price for A is attractive but only if you also take B and C. You actually only want A.

**How to spot:** quote does not unbundled SKUs on request, or unbundled prices are 30-50% higher than the bundled equivalents.

**Counter:** insist on line-item quotes. A supplier who won't quote per-SKU is optimising for wallet share, not for your actual need.

**Tactic 7 — The optionality charge disguised as a setup fee.**

"€8,500 setup per PO." When you ask why, the answer is "our standard." The €8,500 is actually a margin-recovery mechanism because the supplier's unit price is aggressively low.

**How to spot:** setup fee is >5% of the first PO value, and the supplier won't cap it or amortise it over multi-PO commitments.

**Counter:** request setup fee amortisation over 3-5 POs or 12 months. If declined, the setup fee is effectively a price hike in disguise.

---

\newpage

*Procurea — April 2026. For feedback on this template: hello@procurea.io.*
