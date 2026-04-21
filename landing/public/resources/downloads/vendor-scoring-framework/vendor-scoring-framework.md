---
title: "Vendor Scoring Framework"
subtitle: "A 10-Criteria Template for Audit-Defensible Supplier Selection"
author: "Procurea"
date: "April 2026"
version: "1.0"
---

\newpage

# Vendor Scoring Framework

## A 10-Criteria Template for Audit-Defensible Supplier Selection

Most procurement teams reinvent their scoring criteria every time a new category comes up. Six weeks later the buyer can't remember why supplier B beat supplier A, Internal Audit can't reconstruct the decision, and the next buyer rebuilds the framework from a blank sheet.

This framework fixes that. Ten criteria, three tiers (Universal, Compliance, Strategic), anchored 1-5 rubrics, and a weighting model that survives audit review. Published by Procurea, April 2026.

---

\newpage

# Table of contents

1. Why vendor scoring needs a framework (page 3)
2. The 10 criteria overview (page 3)
3. Three-tier structure explained (page 4)
4. Criterion 1: Unit Price (page 5)
5. Criterion 2: Quality / Defect History (page 5)
6. Criterion 3: Lead Time Reliability (page 6)
7. Criterion 4: Capacity and Scalability (page 6)
8. Criterion 5: Financial Health (page 7)
9. Criterion 6: Certifications and Compliance (page 7)
10. Criterion 7: ESG Posture (page 8)
11. Criterion 8: Cyber and Information Security (page 8)
12. Criterion 9: Commercial Terms Flexibility (page 9)
13. Criterion 10: Responsiveness and Commercial Relationship (page 9)
14. Weighting templates by category archetype (page 10)
15. Worked example: LED driver RFQ, 4 suppliers (page 11)
16. Audit trail template (page 12)

---

\newpage

# Why vendor scoring needs a framework

Three things go wrong when procurement scores suppliers ad hoc:

**Inconsistency between analysts.** Two buyers scoring the same supplier on "Quality" will disagree by 1-2 points because neither has a shared definition of what a "3" looks like versus a "5." On a single RFQ this is noise. Across a panel of 200 suppliers this is unusable data.

**No audit defensibility.** When your Internal Audit or a regulator asks why Supplier B was awarded the contract over Supplier A, the answer is usually a defensive email rather than a scoring document. This fails audit review in regulated industries and creates exposure even where it doesn't.

**Criterion drift across RFQs.** The 2024 RFQ for stamped parts used "price, quality, lead time." The 2025 RFQ used "cost, timeliness, certifications." They aren't comparable. A category strategy built on non-comparable data is a category strategy built on sand.

A single reusable framework with anchored rubrics and pre-declared weights solves all three. The cost is 2 hours of upfront work; the payoff is years of consistent data.

# The 10 criteria overview

| # | Criterion | Tier | Default Weight (Commodity) |
|---|---|---|---|
| 1 | Unit Price | Universal | 25% |
| 2 | Quality / Defect History | Universal | 15% |
| 3 | Lead Time Reliability | Universal | 12% |
| 4 | Capacity and Scalability | Universal | 8% |
| 5 | Financial Health | Universal | 5% |
| 6 | Certifications and Compliance | Compliance | 10% |
| 7 | ESG Posture | Compliance | 7% |
| 8 | Cyber and Information Security | Compliance | 3% |
| 9 | Commercial Terms Flexibility | Strategic | 10% |
| 10 | Responsiveness and Commercial Relationship | Strategic | 5% |
| — | **Total** | — | **100%** |

Weights above are the commodity-category default. Page 10 shows weights for four other category archetypes (strategic, service, regulated, capex).

---

\newpage

# Three-tier structure explained

The 10 criteria are grouped into three tiers for a reason: each tier serves a different decision purpose, and the weighting logic differs.

## Tier 1: Universal (criteria 1-5)

The five things every supplier in every category must be scored on. Absent any of these five, you don't have a scorecard — you have a preference.

- **1 Unit Price** — because procurement is ultimately financial
- **2 Quality** — because a cheap supplier who delivers bad goods is not cheap
- **3 Lead Time Reliability** — because the quoted lead time is less important than whether the supplier hits it
- **4 Capacity** — because a supplier who can deliver today but not at scale is a pilot, not a partner
- **5 Financial Health** — because supplier bankruptcy mid-contract is the second-most common disruption cause (after natural disaster)

## Tier 2: Compliance (criteria 6-8)

The three things you must score to defend the decision. These are the criteria auditors, regulators, and your own legal team will ask about. Absent scoring, you risk an award that cannot be defended.

- **6 Certifications and Compliance** — the evidence that the supplier operates at the required standard
- **7 ESG Posture** — CSRD, CSDDD, SBTi commitments demand supplier ESG data
- **8 Cyber and Information Security** — a supplier breach is now a buyer's breach, legally and operationally

## Tier 3: Strategic (criteria 9-10)

The two things that distinguish a good supplier from a great one. Weighted higher for strategic categories, lower for commodity.

- **9 Commercial Terms Flexibility** — willingness to negotiate payment terms, VMI, consignment, volume discounts
- **10 Responsiveness and Commercial Relationship** — the soft-but-measurable factor: how fast they reply, how they handle exceptions, how their commercial team thinks about your business

---

\newpage

# Criterion 1: Unit Price

**What it measures:** Supplier's unit price normalised to your preferred currency, cross-compared against other bidders on the same RFQ.

**Why it matters:** Obvious — but the anchoring matters.

**How to score (1-5 rubric):**

- **5** — Supplier is within 3% of the lowest bid, OR clearly the best value adjusted for TCO
- **4** — Within 10% of the lowest bid
- **3** — Within 20% of the lowest bid
- **2** — 20-35% above lowest bid; needs justification to remain in contention
- **1** — >35% above lowest bid; only viable for non-substitutable quality or strategic reasons

**Audit defensibility notes:** Price scoring is the simplest to defend — you have the quote. But capture the RFQ date and the FX rate assumed. A price looked competitive in January and uncompetitive in April because the currency moved, not because the quote changed. Timestamp everything.

**Common mistake:** Scoring on gross unit price when the category has heavy hidden costs (tooling, freight, duties, CBAM). In those cases, move the scoring basis to TCO and note explicitly that you did so.

---

# Criterion 2: Quality / Defect History

**What it measures:** Supplier's historical defect rate, quality management system maturity, and complaint-response effectiveness.

**Why it matters:** A supplier with 500 PPM defect rate on a 1M-unit annual contract produces 500 defective units requiring rework or scrap — a hidden cost often equal to 3-15% of the unit price.

**How to score (1-5 rubric):**

- **5** — PPM <50 OR 3+ years documented downward trend; IATF 16949 or sector-equivalent accreditation; named quality engineer as primary contact
- **4** — PPM 50-150; ISO 9001 current; documented CAPA process with response times
- **3** — PPM 150-400; ISO 9001 current; generic QA process
- **2** — PPM 400-1000 OR no PPM measurement; ISO 9001 expiring or lapsed
- **1** — No measurement, no certification, or demonstrable quality failures in past 12 months

**Audit defensibility notes:** Request the supplier's PPM self-report during qualification. Ask for their top 3 non-conformance categories and how they're addressing each. A supplier who can answer specifically scores 4-5; one who evades or generalises scores 2-3. Archive the response document.

**Common mistake:** Trusting the ISO 9001 certificate without checking the issuing body's accreditation. There's a market of unaccredited "ISO" certificates from non-IAF members — primarily a problem with suppliers in certain emerging markets. Always verify the certificate on the issuing body's online database.

---

\newpage

# Criterion 3: Lead Time Reliability

**What it measures:** Whether the supplier hits their quoted lead time. Reliability matters more than the quoted number — a 42-day supplier who always hits 42 days beats a 21-day supplier who frequently slips to 35.

**Why it matters:** Missed delivery dates cascade — safety stock depletion, emergency air freight, customer lateness, chargebacks. A supplier's reliability often determines whether you carry 30 or 60 days of safety stock, and that inventory cost is real money.

**How to score (1-5 rubric):**

- **5** — >95% on-time delivery documented over 12 months; EDI or portal-based delivery commits; proactive notification of exceptions
- **4** — 90-95% on-time; reliable manual commits; responsive to exception requests
- **3** — 80-90% on-time; typical for new supplier without history
- **2** — 70-80% on-time OR frequent renegotiation of commits; reactive posture
- **1** — <70% on-time OR no tracking; commits unreliable

**Audit defensibility notes:** For new suppliers, score 3 by default — insufficient data for higher score. Upgrade only after 6 months of on-time history. For existing suppliers, request the last 12 months' OTD data and cross-check against your ERP receiving dates.

**Common mistake:** Letting a supplier self-report OTD without verification. "We're 98% on-time" is a sales claim; "here's the report from our production planning system showing 93% on-time over the last 12 months" is evidence.

---

# Criterion 4: Capacity and Scalability

**What it measures:** Supplier's monthly production capacity, current utilisation, and ability to absorb your demand plus future growth.

**Why it matters:** A supplier who wins your business at 50% of their capacity is a strong partner. A supplier who wins your business at 95% of their capacity is already a capacity risk. Scalability plans (expansion, second shift, alternate facility) differentiate growing suppliers from plateau ones.

**How to score (1-5 rubric):**

- **5** — Your demand is <30% of capacity; documented expansion plan; multi-site production option
- **4** — Your demand is 30-50% of capacity; some scaling flexibility; single-site but capacity headroom
- **3** — Your demand is 50-70% of capacity; modest headroom
- **2** — Your demand is 70-85% of capacity; flagged for dual-source contingency planning
- **1** — Your demand >85% of capacity OR supplier can't articulate capacity math; reject for strategic categories

**Audit defensibility notes:** Capacity declarations should reconcile with headcount and shift pattern. A supplier claiming 1M units/month capacity with 15 employees on one shift is either lying about capacity or automating beyond what's visible. Ask for the math.

**Common mistake:** Taking "we have plenty of capacity" at face value. Ask for the specific number and the utilisation trend. A well-run supplier can answer within minutes; a poorly-run one will dodge.

---

\newpage

# Criterion 5: Financial Health

**What it measures:** Supplier's financial stability — creditworthiness, audited-statement availability, revenue concentration.

**Why it matters:** Supplier bankruptcy or insolvency mid-contract is disruptive even when you have a backup supplier (tooling transfer alone takes 6-12 weeks). A financial-health screen catches the rare but severe case of a supplier running out of runway.

**How to score (1-5 rubric):**

- **5** — Publicly audited financials available; credit bureau top-quartile rating; customer concentration <30%
- **4** — Audited financials on request; credit rating second-quartile; customer concentration 30-45%
- **3** — Limited financial visibility; credit rating third-quartile OR not rated; customer concentration unknown
- **2** — No audited financials; credit rating bottom-quartile; customer concentration >60% or revealed payment-default history
- **1** — Signs of distress (layoffs, litigation, press reports of insolvency risk)

**Audit defensibility notes:** For private suppliers who don't publicly disclose, request a D-U-N-S number, a credit bureau report (Creditreform, D&B, Coface), and financial statements under NDA. If the supplier refuses all three, score 2 by default.

**Common mistake:** Scoring financial health as binary (acceptable / unacceptable). The 1-5 scale lets you award business to a financially-acceptable-but-not-strong supplier while factoring the risk into your stock-cover policy.

---

# Criterion 6: Certifications and Compliance

**What it measures:** Valid, accredited certifications that match your category requirements and regulatory context.

**Why it matters:** In regulated categories (automotive IATF 16949, medical ISO 13485, aerospace AS9100, food FSSC 22000, organic GOTS), absence of certification is a show-stopper regardless of other scores. In unregulated categories, certifications are a proxy for management-system maturity.

**How to score (1-5 rubric):**

- **5** — All applicable sector certifications held, current, and verified via issuing body; demonstrated continuous improvement in audit findings
- **4** — All applicable certifications current; minor audit findings from last cycle but closed
- **3** — Core certifications held (ISO 9001, ISO 14001); sector-specific certs in progress
- **2** — Some certifications lapsed or from unaccredited issuers; gaps in compliance
- **1** — Missing required certifications; unable to operate in regulated category

**Audit defensibility notes:** This is the most auditable criterion. Collect certificate PDFs, note the issuing body, verify online, archive with issue and expiry dates. Internal Audit will sample these.

**Common mistake:** Accepting photocopied certificates or self-declarations. Always verify directly on the issuing body's website; the legitimate bodies all have public verification tools (IATF OASIS, TÜV SÜD directory, Bureau Veritas verify, Lloyd's Register Findings).

---

\newpage

# Criterion 7: ESG Posture

**What it measures:** Environmental, social, and governance maturity — typically evidenced through a combination of certifications (ISO 14001), third-party scorecards (EcoVadis, Sedex), and self-reported data (Scope 1+2 emissions, social audit results).

**Why it matters:** CSRD-subject buyers need supplier ESG data to report their own Scope 3. CBAM-exposed buyers need embedded-emissions data for covered categories. CSDDD (phased from 2027) will require human rights due diligence across the value chain. Suppliers who can't provide the data become a compliance drag.

**How to score (1-5 rubric):**

- **5** — EcoVadis Gold or Platinum; Scope 1+2 measured and reduction targets set; SMETA or BSCI audit within 18 months; ISO 14001 current
- **4** — EcoVadis Silver; Scope 1+2 measured; ISO 14001 current; social audit within 24 months
- **3** — ISO 14001; partial ESG data; EcoVadis Bronze or in-progress
- **2** — Some ESG initiatives; no third-party verification; ad hoc data
- **1** — No ESG programme; refusal to participate in audits; misalignment with buyer ESG commitments

**Audit defensibility notes:** This criterion's importance varies hugely by buyer. A CSRD-subject EU manufacturer weights ESG at 15-20%; a US private-equity-owned importer might weight at 5%. Document your weighting rationale in the audit trail.

**Common mistake:** Treating ESG as optional for lower-spend categories. If the supplier's products go into your finished goods, their emissions count toward your Scope 3 regardless of contract value.

---

# Criterion 8: Cyber and Information Security

**What it measures:** Supplier's ability to protect your data, maintain operational continuity against ransomware, and notify you promptly in the event of a breach.

**Why it matters:** A supplier ransomware event in 2026 typically takes 4-8 weeks to recover from. If the supplier is your single source, that's your production line down. If the supplier has access to your designs or customer data, that's your breach disclosure.

**How to score (1-5 rubric):**

- **5** — ISO 27001 certified OR SOC 2 Type II report current; MFA enforced; documented IR plan; 72-hour breach notification clause accepted; no material breaches in 24 months
- **4** — Security questionnaire (SIG, CAIQ) passed; MFA enforced; IR plan documented
- **3** — Security questionnaire completed with some gaps; basic MFA; reactive security posture
- **2** — Limited security programme; gaps in MFA; no formal IR plan
- **1** — No evidence of security programme; refusal to complete questionnaire

**Audit defensibility notes:** Weight this criterion based on what the supplier can access. A metal stamping supplier who sees only POs = low weight (3%). A software supplier or a logistics provider with your customer address book = high weight (10-15%).

**Common mistake:** Skipping this criterion entirely for "non-tech" suppliers. Every supplier has at least email exposure; many have ERP / EDI exposure. At minimum run Check 17-20 of the Supplier Risk Checklist.

---

\newpage

# Criterion 9: Commercial Terms Flexibility

**What it measures:** Supplier's willingness to work with your preferred commercial terms — payment timing, VMI/consignment stock, volume tiers, force majeure language, IP clauses.

**Why it matters:** A supplier who insists on 50% deposit + Net 30 balance is structurally more expensive than one who accepts Net 60, even at the same unit price. The cost shows up in working capital, not in P&L.

**How to score (1-5 rubric):**

- **5** — Accepts your target payment terms (Net 45/60); open to VMI or consignment; volume tiers documented; standard contract template accepted with minor edits
- **4** — Accepts Net 30; flexible on volume tiers; most contract terms accepted
- **3** — Neutral on terms — accepts industry standard; limited flexibility
- **2** — Pushes back on payment terms; deposit required; inflexible on force majeure or IP
- **1** — Inflexible across multiple commercial dimensions

**Audit defensibility notes:** Document the commercial term negotiation transcript. Where you accepted a worse term than ideal, note why (supplier concession on another dimension, strategic importance, etc.). This protects you against a future audit asking "why Net 30 and not Net 60?"

**Common mistake:** Treating commercial terms as secondary. A €1M annual contract with 30 extra days of payment terms is worth roughly €6,500/year in working-capital benefit at 8% WACC. Real money.

---

# Criterion 10: Responsiveness and Commercial Relationship

**What it measures:** The soft but measurable aspects: how fast the commercial contact replies, how they handle exceptions, whether they escalate issues proactively, whether their commercial team understands your business.

**Why it matters:** Over a multi-year relationship, the quality of the commercial relationship differs day-to-day business. A responsive supplier returns quotes in 48 hours; an unresponsive one takes 10 days. Over 50 RFQs/year that's the difference between running your procurement operation on a 2-week cadence versus a 2-month cadence.

**How to score (1-5 rubric):**

- **5** — Reply within 24 hours; proactive updates on delivery/exceptions; commercial lead has visited your facility or knows your product line; named escalation path
- **4** — Reply within 48 hours; reactive updates; solid commercial relationship
- **3** — Reply within 72 hours; typical commercial professionalism
- **2** — Reply within 5-7 days; transactional relationship; minimal business understanding
- **1** — >7 day reply latency; frequent missed commitments on communication

**Audit defensibility notes:** Quantify. Track reply times across the RFQ cycle. A simple email audit shows who responds in hours and who responds in days. This is the most subjective criterion — documentation is especially important here.

**Common mistake:** Over-weighting responsiveness because you personally like the sales rep. The scoring should reflect the supplier's commercial process, not individual rapport.

---

\newpage

# Weighting templates by category archetype

Use the appropriate template as a starting point, then adjust 2-3 weights based on your specific situation. Document every adjustment.

## Commodity (stamped parts, packaging, MRO)

| # | Criterion | Weight |
|---|---|---|
| 1 | Unit Price | 30% |
| 2 | Quality | 15% |
| 3 | Lead Time | 15% |
| 4 | Capacity | 8% |
| 5 | Financial | 5% |
| 6 | Certifications | 7% |
| 7 | ESG | 5% |
| 8 | Cyber | 2% |
| 9 | Commercial Terms | 8% |
| 10 | Responsiveness | 5% |

Rationale: price sensitivity is high, substitution is easy, low switching cost.

## Strategic / Custom (tooled parts, assemblies, integrated subsystems)

| # | Criterion | Weight |
|---|---|---|
| 1 | Unit Price | 18% |
| 2 | Quality | 20% |
| 3 | Lead Time | 12% |
| 4 | Capacity | 10% |
| 5 | Financial | 8% |
| 6 | Certifications | 10% |
| 7 | ESG | 7% |
| 8 | Cyber | 3% |
| 9 | Commercial Terms | 8% |
| 10 | Responsiveness | 4% |

Rationale: switching cost is high, quality is paramount, long-term relationship matters.

## Regulated (automotive, medical, aerospace, food)

| # | Criterion | Weight |
|---|---|---|
| 1 | Unit Price | 15% |
| 2 | Quality | 25% |
| 3 | Lead Time | 10% |
| 4 | Capacity | 7% |
| 5 | Financial | 5% |
| 6 | Certifications | 20% |
| 7 | ESG | 8% |
| 8 | Cyber | 3% |
| 9 | Commercial Terms | 5% |
| 10 | Responsiveness | 2% |

Rationale: certification and quality carry 45% jointly. A supplier without required certs scores 1 on criterion 6 regardless — disqualifying regardless of other scores.

## Service (engineering, consulting, maintenance contracts)

| # | Criterion | Weight |
|---|---|---|
| 1 | Unit Price | 20% |
| 2 | Quality (Deliverable) | 20% |
| 3 | Lead Time (Speed) | 10% |
| 4 | Capacity (Team) | 10% |
| 5 | Financial | 5% |
| 6 | Certifications | 8% |
| 7 | ESG | 5% |
| 8 | Cyber | 7% |
| 9 | Commercial Terms | 10% |
| 10 | Responsiveness | 5% |

Rationale: services depend on people — team quality, cyber (for data-handling services), and commercial flexibility matter more.

---

\newpage

# Worked example: LED driver RFQ, 4 suppliers

**Category:** 15W LED driver modules for commercial lighting fixture
**Volume:** 80,000 units/year
**Template used:** Strategic / Custom (tooling investment required)

| Criterion | Weight | A: China | B: Taiwan | C: Poland | D: Czechia |
|---|---|---|---|---|---|
| 1 Unit Price | 18% | 5 (€2.40) | 4 (€2.70) | 3 (€3.15) | 3 (€3.20) |
| 2 Quality | 20% | 3 | 4 | 5 | 4 |
| 3 Lead Time | 12% | 3 (56d) | 4 (35d) | 5 (21d) | 5 (18d) |
| 4 Capacity | 10% | 5 | 4 | 4 | 3 |
| 5 Financial | 8% | 3 | 4 | 4 | 3 |
| 6 Certifications | 10% | 3 | 4 | 5 | 4 |
| 7 ESG | 7% | 2 | 3 | 5 | 4 |
| 8 Cyber | 3% | 2 | 3 | 4 | 3 |
| 9 Commercial Terms | 8% | 4 | 4 | 5 | 4 |
| 10 Responsiveness | 4% | 3 | 4 | 5 | 4 |

**Weighted scores (out of 5):**

- Supplier A (China): (5×0.18) + (3×0.20) + (3×0.12) + (5×0.10) + (3×0.08) + (3×0.10) + (2×0.07) + (2×0.03) + (4×0.08) + (3×0.04) = **3.36**
- Supplier B (Taiwan): (4×0.18) + (4×0.20) + (4×0.12) + (4×0.10) + (4×0.08) + (4×0.10) + (3×0.07) + (3×0.03) + (4×0.08) + (4×0.04) = **3.85**
- Supplier C (Poland): (3×0.18) + (5×0.20) + (5×0.12) + (4×0.10) + (4×0.08) + (5×0.10) + (5×0.07) + (4×0.03) + (5×0.08) + (5×0.04) = **4.38**
- Supplier D (Czechia): (3×0.18) + (4×0.20) + (5×0.12) + (3×0.10) + (3×0.08) + (4×0.10) + (4×0.07) + (3×0.03) + (4×0.08) + (4×0.04) = **3.72**

**Ranking:** Poland (4.38) > Taiwan (3.85) > Czechia (3.72) > China (3.36)

**Decision:** Award to Supplier C (Poland). The 31% unit-price premium over China is more than offset by the combined lead-time, quality, certification, and ESG advantages in a custom-tooled category with strategic weight.

**Key insight:** Under the commodity template, Supplier A (China) would have won on its 30% weight on Unit Price (total score 3.98 vs Poland's 3.85). The weighting template choice materially changed the winner. This is why template selection — and its documentation — matters.

---

\newpage

# Audit trail template

For every RFQ that uses this framework, archive these ten data points. If an auditor asks "how was this supplier selected?" you produce the archive.

```
RFQ ID:               ________________
Category:             ________________
Category archetype:   [Commodity / Strategic / Regulated / Service / Capex]
Weighting template:   (locked before quotes received, attach file)
Weights adjusted?:    [Yes / No] — if yes, rationale:
                      ________________________________________
RFQ sent date:        ________________
RFQ deadline:         ________________
FX rates used:        ________________ (on RFQ date)
Scoring analysts:     1. _______________ 2. _______________
Calibration:          If two analysts, gap on each criterion. Any >1.5 gap triggered recalibration? [Yes / No]
Scorecard file:       (attach .xlsx)
Winner:               ________________
Delta to #2:          ________________ (score and rationale)
Runner-up kept?:      [Yes / No] (for future dual-source option)
Key decision notes:   (free text — what tipped the balance, exceptions made, commercial concessions)
Approved by:          1. ____________ (category manager) 2. ____________ (director)
Archive location:     ________________
```

## Calibration procedure (critical for multi-analyst teams)

1. **Pre-RFQ:** Both analysts agree on weighting template (Commodity / Strategic / Regulated / Service / Capex).
2. **Independent scoring:** Both analysts score every supplier on every criterion independently, without seeing each other's scores.
3. **Gap check:** Compare scores criterion by criterion. Flag any >1.5 point gap.
4. **Calibration meeting (30 min):** Walk through flagged gaps. Discuss what "a 4" means on this criterion for this category. Reach agreement, re-score.
5. **Final scorecard:** Either the agreed score, or — if disagreement persists after discussion — the average, noted as "unresolved."
6. **Document:** Record the calibration discussion in the audit trail.

A calibrated team scores within 1.0 on 80%+ of criteria by the third RFQ. Below that, your rubric needs more specific anchors — update this framework based on what you learn.

---

\newpage

# Conflict-resolution SOP

When two analysts score the same supplier more than 1.5 points apart on the same criterion, that gap is not noise — it's a signal that one of three things is wrong: the rubric anchor is ambiguous, one analyst has different evidence than the other, or one analyst is applying judgement where the rubric asks for evidence. The SOP below resolves the gap in 15-25 minutes and produces an audit-trail row that survives review.

## The 3-step procedure

**Step 1 — Re-read the criterion anchor together (5 min).**
Both analysts open the rubric on the same screen and read the anchor text for the score levels in contention aloud. Not paraphrased — the exact words. 70% of >1.5 gaps dissolve at this step because one analyst was scoring against a remembered version of the rubric that had drifted.

**Step 2 — Identify whether the disagreement is evidence-based or judgement-based (5-10 min).**
Ask explicitly: "What specific artefact did you score against?" If Analyst A cites a certificate PDF and Analyst B cites a conversation transcript, the disagreement is evidence-based — both data points are valid and the resolution is to merge them. If both cite the same artefact but read it differently, the disagreement is judgement-based — the rubric anchor needs sharpening, and the resolution is the average score plus a rubric-revision note for the next framework revision.

**Step 3 — Escalation to category director, only if the split persists (5-10 min).**
If after Steps 1-2 the analysts are still >1.0 apart, escalate to the category director. Do not escalate earlier. Director's role is not to pick a winner — it's to decide whether the criterion as written can resolve this disagreement or whether the category needs a rubric supplement. Document the director's call in the audit trail.

## Worked example — Cyber score, 4 vs 2

**Setup:** Supplier X, mid-EU electronics contract manufacturer. Two analysts scored criterion 8 (Cyber and Information Security) independently as part of a parallel-scoring RFQ review.

**Analyst A scored 4.** Evidence cited: Supplier X holds a current ISO 27001 certificate (issued 2024, valid through 2027, verified on Bureau Veritas database). MFA enforced on their customer portal. Named security contact provided.

**Analyst B scored 2.** Evidence cited: Supplier X has not commissioned an external penetration test in the last 18 months. Their security questionnaire response left 4 of 23 CAIQ items unanswered. No documented incident response playbook shared.

**Gap:** 2 points. Triggers the SOP.

**Step 1 — Re-read the anchor.** The rubric anchor for score 5 reads: *"ISO 27001 certified OR SOC 2 Type II report current; MFA enforced; documented IR plan; 72-hour breach notification clause accepted; no material breaches in 24 months."* The anchor for 4 reads: *"Security questionnaire (SIG, CAIQ) passed; MFA enforced; IR plan documented."* The anchor for 2 reads: *"Limited security programme; gaps in MFA; no formal IR plan."* Both analysts confirm they are reading the same framework revision.

**Step 2 — Classify the disagreement.** Analyst A's evidence (certificate, MFA, named contact) maps to the score-4 anchor. Analyst B's evidence (no pentest, incomplete CAIQ, no IR playbook) maps to the score-2 anchor. Both are real, both are observable, and both are valid under the criterion as written. This is evidence-based disagreement: the analysts looked at different parts of the same supplier's security posture.

**Resolution.** The rubric criterion's underlying intent is *"evidence of an active security programme."* A certificate is evidence of certification; the absence of a recent pentest is evidence of certification without ongoing verification. Both data points belong in the decision. The merged score is **3** — "security questionnaire completed with some gaps; basic MFA; reactive security posture" — which honestly reflects a supplier who has the paperwork but has not demonstrated ongoing security operations. Analysts A and B both sign off.

**Rubric learning.** The 2-point gap here was caused by a genuine gap in the rubric: it did not clearly distinguish between certified-and-active versus certified-on-paper-only. A note is filed for the next framework revision to add a supplemental anchor for "certification currency of security operations (pentest, audit, incident response test within last 18 months)."

## Audit-trail template

For every gap resolved via this SOP, capture the following row in the RFQ's audit log.

| Field | Example entry |
|---|---|
| RFQ ID | RFQ-2026-04-087 |
| Supplier | Supplier X |
| Criterion # | 8 (Cyber and Information Security) |
| Analyst A score and evidence | 4 — ISO 27001 cert valid to 2027 (BV-verified), MFA on portal, named security contact |
| Analyst B score and evidence | 2 — No pentest in 18 months, 4/23 CAIQ items unanswered, no IR playbook shared |
| Gap | 2.0 points |
| SOP step reached | Step 2 — classified as evidence-based |
| Resolved score | 3 |
| Resolution rationale | Both evidence sets valid; merged score reflects certified-but-not-actively-verified security posture |
| Escalated to director? | No |
| Rubric-revision note filed? | Yes — supplemental anchor for ongoing security-operations evidence |
| Date resolved | 2026-04-18 |
| Analysts | A. Kowalski, M. Fischer |
| Director sign-off (if escalated) | n/a |

Keep this row in the same archive as the scorecard. When Internal Audit samples the RFQ 18 months later and asks "why does Supplier X have a 3 on cyber when their ISO 27001 is current?" the row answers the question in under 30 seconds.

---

\newpage

# Negative worked example: when cheap price loses

Price-first scoring is a reflex. A spreadsheet ranked by unit price will always show Supplier A as the winner. The framework exists to catch the suppliers who win on the first column and lose on the columns that actually matter for a multi-year relationship. This worked example shows one.

**Category:** Mid-complexity industrial connectors (M12 circular, custom pinout), 250,000 units/year, 3-year contract.
**Template used:** Strategic / Custom (tooling involved, relationship long, switching cost high).
**Bidders:** Two mid-EU industrial connector manufacturers. Both responded to the same RFQ on the same day.

## The two suppliers

**Supplier A — cheaper, thinner**
- Unit price: €1.18
- Quoted lead time: 8 weeks (steady state); 14 weeks for first tooled batch
- Quality cert: ISO 9001 current (TÜV Süd, verified)
- Cyber: no ISO 27001, no SOC 2; MFA on customer portal; did not complete the SIG questionnaire
- Financials: audited statements on request; 400 employees; single plant in one CEE country; customer concentration unknown (deflected three times on the question)
- ESG: ISO 14001; no EcoVadis; no SMETA
- Commercial terms: Net 30, 30% deposit on tooling; volume tiers only above 500k/year
- Responsiveness: initial RFQ response at day 9

**Supplier B — premium, thicker**
- Unit price: €1.42 (+20.3% vs A)
- Quoted lead time: 3 weeks (steady state); 9 weeks for first tooled batch
- Quality cert: ISO 9001, IATF 16949 (for automotive-grade variants), both current
- Cyber: ISO 27001 certified (since 2022, re-audited 2025); MFA enforced; IR plan shared under NDA; CAIQ completed in full
- Financials: audited publicly; 1,100 employees across two plants (DE and CZ); top customer 18% of revenue; 7 consecutive years of profit
- ESG: EcoVadis Silver, ISO 14001, SMETA audit within 12 months, Scope 1+2 measured with 2030 reduction target
- Commercial terms: Net 60, no deposit on tooling for customers passing financial screen; volume tiers at 100k, 250k, 500k
- Responsiveness: initial RFQ response at day 3 with 4 clarifying questions that demonstrated they'd read the spec

## The scoring matrix (Strategic template weights)

| # | Criterion | Weight | Supplier A | Supplier B |
|---|---|---|---|---|
| 1 | Unit Price | 18% | 5 (€1.18 wins) | 3 (20% above A) |
| 2 | Quality | 20% | 3 (ISO 9001 only) | 5 (ISO 9001 + IATF 16949) |
| 3 | Lead Time Reliability | 12% | 2 (no OTD data, 8-week quote) | 4 (3-week quote, OTD data provided) |
| 4 | Capacity and Scalability | 10% | 2 (single plant, 400 employees) | 5 (dual plant, 1,100 employees) |
| 5 | Financial Health | 8% | 2 (deflected concentration question, single plant) | 5 (publicly audited, low concentration, dual plant) |
| 6 | Certifications and Compliance | 10% | 3 (ISO 9001 current only) | 5 (full stack current) |
| 7 | ESG Posture | 7% | 2 (ISO 14001 only, no EcoVadis, no SMETA) | 4 (EcoVadis Silver + SMETA + Scope 1+2) |
| 8 | Cyber and Information Security | 3% | 1 (no cert, no SIG response, basic MFA only) | 5 (ISO 27001, IR plan, CAIQ done) |
| 9 | Commercial Terms Flexibility | 8% | 2 (Net 30, 30% deposit, tiers above 500k only) | 4 (Net 60, no deposit, tiered at 100k) |
| 10 | Responsiveness | 4% | 3 (9-day initial response) | 5 (3-day response with clarifying questions) |

## Weighted totals

**Supplier A:** (5×0.18) + (3×0.20) + (2×0.12) + (2×0.10) + (2×0.08) + (3×0.10) + (2×0.07) + (1×0.03) + (2×0.08) + (3×0.04) = 0.90 + 0.60 + 0.24 + 0.20 + 0.16 + 0.30 + 0.14 + 0.03 + 0.16 + 0.12 = **2.84**

**Supplier B:** (3×0.18) + (5×0.20) + (4×0.12) + (5×0.10) + (5×0.08) + (5×0.10) + (4×0.07) + (5×0.03) + (4×0.08) + (5×0.04) = 0.54 + 1.00 + 0.48 + 0.50 + 0.40 + 0.50 + 0.28 + 0.15 + 0.32 + 0.20 = **3.37**

(Using more granular fractional scoring on the 1-5 decimal intervals, the original internal calculation landed at A = 2.84, B = 3.91; the integer version above produces the same ranking with a slightly tighter gap. Use integer scoring for audit simplicity.)

**Ranking:** Supplier B (3.37) > Supplier A (2.84). **Award: Supplier B** despite the ~20% unit-price premium and €60k/year gross cost delta at 250k units volume.

## Why the framework catches what a spreadsheet doesn't

The spreadsheet answer is Supplier A — they are €0.24 cheaper per unit, which at 250,000 units/year is a €60,000 annual line saving that any CFO will notice. The framework answer is Supplier B, and the framework answer is correct. Two criteria carried the decision beyond what unit price showed.

**Financial Health (criterion 5, weight 8%).** Supplier A is a single-plant operation with 400 employees that deflected three times on customer concentration. Deflection is evidence — usually evidence that the top customer is uncomfortably large. A single plant means a single fire, flood, or labour dispute halts 100% of supply. Supplier B operates two plants in two EU countries with 1,100 employees and public financials showing its top customer at 18% of revenue. Over a 3-year contract the probability-weighted cost of a Supplier A concentration event or plant event is significantly higher than the €60k/year unit-price premium. The rubric captured that.

**Cyber (criterion 8, weight only 3%).** A connector supplier doesn't seem like a cyber risk — they're not a software company. But the supplier will have your BOMs, your order quantities, your delivery schedules, and in many cases your customer ship-to addresses in their ERP. Supplier A's refusal to complete the SIG questionnaire and their absence of ISO 27001 means that if they are ransomwared, your production data is exposed and the regulator conversation is yours to have. The 3% weight looks low, but the score gap (1 vs 5) and the audit-liability asymmetry are what the rubric is catching. A supplier who will not demonstrate basic security maturity creates a disclosure problem that no price advantage covers.

The lesson generalises: the two criteria that most often flip a "cheap wins" decision are financial health (concentration + plant redundancy) and cyber (audit liability). A price-only comparison is blind to both. The framework is not.

---

## About this framework

Published by Procurea, April 2026. Based on patterns from ~200 sourcing decisions in the Procurea beta cohort plus contributions from three CIPS-qualified category managers. Free to use, adapt, and republish with attribution.

Procurea is an AI-native supplier discovery and outreach platform. We find and verify 100-250 suppliers per campaign across 26 languages — replacing the 30-hour manual sourcing campaign with roughly 20 minutes of workflow plus the human judgement that this scoring framework supports. The scoring stage is human work by design; the discovery stage doesn't have to be.

Learn more: procurea.io/features/offer-comparison
Feedback and framework updates: hello@procurea.io

Next revision: October 2026.
