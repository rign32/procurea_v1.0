# RFQ Comparison Template — How to Use

A working buyer's template for comparing 2-20 supplier quotes side-by-side, with a defensible weighted scoring model that survives Internal Audit review.

## What's in this bundle

- `rfq-comparison-template.csv` — the core comparison table with 10 fields and 3 pre-filled sample rows (machined metal parts, EUR pricing). Open in Excel or Google Sheets and extend.
- `rfq-comparison-template-notion.md` — full Notion database schema with formula snippet, views, and seed data.
- `INSTRUCTIONS-TO-CONVERT.md` — how to convert the CSV into a proper Excel workbook with live formulas.
- `README.md` — this file.

## The 10 comparison fields

Every RFQ comparison should capture at least these ten data points for each supplier. Any field left blank after the quote deadline flags the row as "incomplete" — do not score incomplete rows against complete rows.

1. **Supplier Name** — legal entity name as it appears on the quote. Not the trading name. Legal entity is what you will eventually contract with.
2. **Country** — country of production, not country of sales office. A "German supplier" with production in Turkey has Turkey's lead time and CBAM exposure, not Germany's.
3. **Unit Price (EUR)** — normalize every quote to a single currency before scoring. If the quote is in TRY or CNY, use the spot rate on the quote date and note it. FX at quote time is not FX at PO time — build in a 3-5% buffer.
4. **MOQ (Minimum Order Quantity)** — in units, not in €. A €40,000 MOQ at €2/unit is 20,000 units — often unusable even if unit price is attractive.
5. **Lead Time (days)** — from PO confirmation to FCA/FOB at the named port. Not door-to-door. Do not compare EXW China to DDP Poland lead times directly; they are different metrics.
6. **Payment Terms** — Net 30, Net 45, Net 60, T/T 30/70, 50% deposit. Each has a cash-flow cost. A Net 60 quote is effectively cheaper than a Net 30 quote at the same unit price by roughly (30 × cost_of_capital / 365) per unit. For a company at 8% WACC, 30 extra days of payment = ~0.66% effective discount.
7. **Certifications** — name them explicitly. "Certified" is not a certification. ISO 9001:2015 has a certificate number, an issuing body, and an expiry date. Ask for the certificate PDF during qualification, not after PO.
8. **Incoterm** — Incoterms 2020. EXW means the supplier literally hands you the crate at their factory door. DDP means they clear customs. Comparing EXW to DDP without normalising is the single most common error we see in first-time buyers.
9. **Sample Available** — Yes-free, Yes-paid, No. A supplier who refuses samples is a red flag for categories where physical inspection matters. For commodity categories (standardised electronics, raw materials), samples may be waived.
10. **Notes** — free text for the things the structured fields don't capture. Tooling amortization status, language of commercial lead, audit history, referrals, red flags. The Notes column is where the buyer's judgement lives. Do not delete it in the name of "clean data."

## The weighted scoring formula

Score each supplier 1-5 on four summary dimensions, then apply weights.

**Default weights (commodity category):**

| Dimension | Weight |
|---|---|
| Price | 40% |
| Quality (certs + defect history + references) | 25% |
| Lead Time (days + reliability of commitment) | 20% |
| Terms (payment + incoterm flexibility) | 15% |

Weighted score out of 100 = (Price × 40 + Quality × 25 + Lead Time × 20 + Terms × 15) / 5 × 20

Example: Supplier scoring 4, 4, 3, 4 → (4×40 + 4×25 + 3×20 + 4×15) / 5 × 20 = (160 + 100 + 60 + 60) / 100 × 20 = 76.

**Adjusting weights per category archetype:**

- **Commodity / standardized parts** — Price 50%, Quality 20%, Lead Time 20%, Terms 10%
- **Strategic / custom parts** — Price 25%, Quality 35%, Lead Time 20%, Terms 20%
- **Regulated (medical, aerospace, food)** — Price 20%, Quality 45%, Lead Time 20%, Terms 15%
- **Services (engineering, consulting)** — Price 30%, Quality 35%, Lead Time 15%, Terms 20%

Document your weights before you see the quotes. Adjusting weights after scores are in is the fastest way to fail an audit.

## Defensibility notes (for audit review)

When Internal Audit asks "why did you pick supplier B over supplier A?", you need a paper trail. This template gives you that trail if you do three things:

1. **Version-lock the weights.** Save the spreadsheet with weights before quotes are received. Email it to your category director. Timestamped.
2. **Score blind where possible.** Have two analysts score the same supplier independently on Quality and Lead Time. If their scores differ by more than 1.5 points, discuss and recalibrate — do not average blind.
3. **Keep the Notes column.** Audit wants to see that the decision was considered, not computed. "Nordweld chosen over Burç despite higher unit price because Nordweld holds IATF 16949 which is mandatory for our customer's automotive Tier 1 supply" is a defensible one-liner.

## Usage guide: your first 30 days

**Week 1** — duplicate this template per active RFQ. Fill the supplier list. Send the RFQ (use a structured RFQ cover letter — not a generic email).

**Week 2** — as quotes arrive, populate rows. Flag any supplier who sends a quote that's missing MOQ, lead time, or certs — do not chase silently; email them back asking for the missing fields explicitly.

**Week 3** — score the complete rows. Get a second analyst to co-score strategic categories.

**Week 4** — decision meeting. Present the scored sheet. Award. Document the decision rationale in the Notes column of the winner.

## How Procurea fits (light touch)

This template is free and standalone. If you run 5+ RFQs per quarter and the comparison step is still taking you hours per RFQ, the Procurea platform automates the earlier stages — finding the 100-250 verified suppliers to invite in the first place, with multilingual outreach in 26 languages — and pipes the results into a comparison view like this one. Thirty hours of manual sourcing becomes roughly twenty minutes of workflow plus human judgement on the shortlist. The comparison stage still wants a human. That's why we built this template.

See `procurea.io/features/offer-comparison` if you want to see the comparison integrated with the sourcing pipeline, or keep using this Excel — it works.
