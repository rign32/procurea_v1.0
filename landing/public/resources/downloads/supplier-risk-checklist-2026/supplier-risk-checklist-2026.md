---
title: "Supplier Risk Checklist 2026"
subtitle: "The 20-Point Verification Guide for Procurement Teams"
author: "Procurea"
date: "April 2026"
version: "1.0"
---

\newpage

# Supplier Risk Checklist 2026

## The 20-Point Verification Guide for Procurement Teams

A practitioner checklist — not a consulting framework. Twenty verification points across five risk dimensions, each with a named data source, a concrete red-flag threshold, and a re-check cadence. Designed to be run once per new supplier and re-run on a rolling schedule for the existing panel.

Built from the patterns we see in Procurea's beta cohort: mid-market manufacturers and importers running 200-2000 SKUs across multi-country supply bases, where a single bad qualification costs more than a year of platform fees.

**Published:** April 2026
**Next revision:** October 2026 (quarterly refresh for geopolitical indicators, annual for regulatory)

---

\newpage

# Table of Contents

1. Why 20 points (page 3)
2. The five risk dimensions (page 3)
3. How to use this checklist (page 4)
4. The 20 verification points (pages 5-9)
   - Financial health: checks 1-4
   - Operational resilience: checks 5-8
   - Geopolitical & regulatory: checks 9-12
   - ESG & compliance: checks 13-16
   - Cyber & information security: checks 17-20
5. Red-flag summary matrix (page 10)
6. Re-check cadence template (page 11)
7. Printable one-page version (page 12)

---

\newpage

# Why 20 points

In 2019 a 12-point checklist was enough. In 2026 it isn't. Three things changed.

**Geopolitics stopped being background context.** Ukraine, Red Sea routing, US-China tariff rounds, and the CBAM phase-in all moved from "monitor" to "verify per supplier." Five years ago a procurement team could qualify a Vietnamese electronics supplier without opening a tariff-exposure tab. Today that's negligence.

**Cyber became everyone's problem.** When a mid-tier metal stamping supplier in Germany gets ransomware and can't ship for six weeks, your production line is down regardless of what's in your ISO 27001 audit. The SolarWinds and MOVEit incidents proved that supplier cyber posture is buyer cyber exposure.

**ESG regulation got teeth.** CSRD, CBAM, and the EU CSDDD (Corporate Sustainability Due Diligence Directive, phased in 2027-2029) mean that supplier ESG data is now a compliance input, not a values statement. You need the documentation, not a pledge.

Twenty points is the minimum to cover the five dimensions without over-engineering. A good mid-market procurement team can run all twenty on a new supplier in 45 minutes if the data sources are pre-bookmarked. That's the version of "due diligence" that actually happens, which is the only version that matters.

# The five risk dimensions

| Dimension | What it protects against | Primary data sources |
|---|---|---|
| **Financial health** | Bankruptcy, insolvency, supply interruption mid-contract | National business registries, D&B, Creditreform, Bisnode, bank references |
| **Operational resilience** | Capacity failure, single-site dependence, quality collapse | Factory audit reports, ISO 9001 certificate, customer references, insurance |
| **Geopolitical & regulatory** | Sanctions exposure, tariff shocks, export control violations | OFAC SDN list, EU sanctions map, export classification, CBAM registry |
| **ESG & compliance** | Reputational damage, CSRD non-compliance, Scope 3 gaps | EcoVadis, Sedex, ISO 14001 certificate, Scope 1+2 disclosure |
| **Cyber & information security** | Ransomware shutdown, data breach, IP leakage | ISO 27001, SOC 2 Type II, Have I Been Pwned, security questionnaire |

Dimensions are weighted by exposure. A supplier for non-critical office supplies does not need a SOC 2 review. A tier-one electronics supplier building boards that ship to your customers does. The checklist is a menu — apply the checks proportional to the category criticality.

---

\newpage

# How to use this checklist

## Quick-scan version (5 minutes)

If you're qualifying a supplier for a one-off purchase under €25,000, run these four checks and stop:

1. Check 1 — Legal entity exists (business registry lookup)
2. Check 9 — Sanctions screening (OFAC / EU lists)
3. Check 5 — ISO 9001 current (for relevant categories)
4. Check 17 — Has the domain been in a breach (Have I Been Pwned)

If any of these four fails, stop. If all four pass, proceed with the purchase and deferred full review only if volume grows.

## Deep audit version (45 minutes)

For a supplier who will become panel-resident (expected 3+ POs over 12 months, or single-PO value above €50k):

- Run all 20 checks in sequence.
- Document findings in a risk scoring sheet (we use a simple 0-2 per check, 40 max; ≥32 = approved, 24-31 = conditional, <24 = reject or remediation).
- Archive the evidence PDFs (certificate copies, registry screenshots, sanctions-list results with date). Internal Audit will ask for these when a supplier is eventually involved in an incident.
- Schedule the next review per the cadence table on page 11.

## Who does what

- **Buyer / category manager** — runs checks 1, 5, 6, 7, 8, 12, 13 (operational + compliance evidence)
- **Finance / controller** — runs checks 2, 3, 4 (financial health)
- **Trade compliance / legal** — runs checks 9, 10, 11 (sanctions, export, regulatory)
- **InfoSec (or outsourced advisor)** — runs checks 17, 18, 19, 20 (cyber)
- **Sustainability lead or procurement** — runs checks 14, 15, 16 (ESG)

If you don't have a dedicated sustainability lead or InfoSec team (typical at <300 employees), the buyer does a lighter version of each using the documentary evidence-only method: request the certificate PDF, verify the certificate number on the issuing body's database, archive. Skip live audits.

---

\newpage

# The 20 verification points

## Financial health (checks 1-4)

### Check 1: Legal entity verification

**What to check:** The supplier exists as a registered legal entity with the name, address, and tax ID shown on their quote.

**Source of truth:**
- EU: VIES (ec.europa.eu/taxation_customs/vies) for VAT validation, national business registries (e.g. KRS in Poland, Handelsregister in Germany, Ticari Sicil in Turkey)
- US: Secretary of State registry for the supplier's state, EIN via TIN Matching (buyer-accessible via CP575 letter)
- UK: Companies House (companieshouse.gov.uk)
- Global: D&B D-U-N-S lookup

**Red flag threshold:** Any mismatch between the name on the quote and the registered entity; registration less than 12 months old for a supplier claiming 10+ years of operations; registered address that maps to a residential building or a mailbox service for a manufacturing supplier.

**Re-check cadence:** Annual, or immediately if supplier announces restructuring, acquisition, or name change.

---

### Check 2: Financial stability indicator

**What to check:** Creditworthiness signal from a third-party credit bureau. You're not doing forensic accounting — you're confirming no major red flag (recent default, court judgment, drastic turnover contraction).

**Source of truth:**
- EU: Creditreform, Bisnode, Coface, Atradius
- Global: D&B, Moody's
- Country-specific: Infogreffe (FR), KBIS (FR), Cerved (IT), BIK (PL)

**Red flag threshold:** Credit score in the bottom quartile for the country/sector; publicly recorded payment defaults in the past 24 months; DSO deterioration trend of >20 days year-over-year.

**Re-check cadence:** Annual for panel suppliers; at each contract renewal.

---

### Check 3: Audited financial statements availability

**What to check:** The supplier publishes or shares audited statements for the last two fiscal years. Private firms in some jurisdictions (US LLCs, Turkish private A.Ş.) are not required to publish — in that case request under NDA.

**Source of truth:**
- EU: official registries publish balance sheets for most corporate forms (KRS, Handelsregister, Companies House)
- Private firms: direct request under NDA, signed by supplier CFO

**Red flag threshold:** Refusal to share under NDA for a supplier above €2M revenue; negative equity two years running; interest coverage ratio (EBIT/Interest) below 1.5 for a supplier carrying debt.

**Re-check cadence:** Annual.

---

### Check 4: Concentration risk (revenue dependence)

**What to check:** What percentage of the supplier's revenue comes from their single largest customer? A supplier who depends on one customer for 60%+ of revenue is one contract renewal away from layoffs and capacity collapse.

**Source of truth:** Direct question in qualification interview. Cross-check against LinkedIn employee count trends and any public statements about major customer wins/losses.

**Red flag threshold:** Single-customer concentration >40%; top-3 customer concentration >70%. These suppliers deserve qualification but flag them for higher review cadence.

**Re-check cadence:** Annual.

---

\newpage

## Operational resilience (checks 5-8)

### Check 5: ISO 9001 (or equivalent) current

**What to check:** Valid, current ISO 9001:2015 quality management system certificate — or the sector equivalent (IATF 16949 automotive, ISO 13485 medical, AS9100 aerospace, ISO 22000 food). Certificate must name the facility that will produce your goods, not a holding company.

**Source of truth:** Certificate PDF from supplier + verification on issuing body's database (e.g. IATF OASIS, TÜV SÜD directory, Bureau Veritas verify, Lloyd's Register findings).

**Red flag threshold:** Certificate expired; certificate covers a different facility than the one producing your goods; issuing body not accredited by IAF (International Accreditation Forum) — there's a non-trivial market of unaccredited "ISO" certificates especially for suppliers in lower-compliance jurisdictions.

**Re-check cadence:** Annual for validity; re-verify issuing body accreditation on first qualification only.

---

### Check 6: Capacity and single-site dependence

**What to check:** Does the supplier produce your goods at a single facility? What's the monthly capacity at that facility, and what percentage will your order consume? A supplier producing 100% of your category at one site with 80%+ capacity utilization is a fragile dependency.

**Source of truth:** Capacity declaration in qualification questionnaire + cross-check during factory audit (physical or virtual). Ask for hours-of-operation, shifts, and headcount — the math should reconcile with the claimed throughput.

**Red flag threshold:** Single facility producing all of your demand + that facility running at >75% utilisation + no documented alternate production site within the supplier's own network. Your order becomes the first thing bumped when bigger customers escalate.

**Re-check cadence:** Annual; immediate review if supplier announces expansion, M&A, or layoffs.

---

### Check 7: Defect rate and warranty history

**What to check:** PPM (parts per million) defect rate over trailing 12 months from the supplier's existing customer base, or for new suppliers, the defect rate from their internal final-inspection data.

**Source of truth:** Quality report from supplier (usually quarterly). For first-time qualification, ask for their internal PPM by product family.

**Red flag threshold:** PPM >500 for commodity mechanical parts; >100 for safety-critical assemblies; no PPM data at all from a supplier claiming ISO 9001 (the certification requires you to measure this — absence = they don't).

**Re-check cadence:** Quarterly for panel suppliers; drive continuous-improvement targets through the annual review cycle.

---

### Check 8: Business continuity and insurance

**What to check:** Does the supplier carry product liability insurance, and do they have a documented business continuity plan for the top three disruption scenarios (fire, key-person loss, single-supplier raw material failure)?

**Source of truth:** Certificate of Insurance (COI) from their broker, named to your company as additional insured if the category is risk-heavy. Business Continuity Plan (BCP) summary — 2-page document minimum.

**Red flag threshold:** Product liability cover below €2M for commercial suppliers, below €10M for automotive/medical/aerospace; no BCP at all for a supplier >50 employees; insurance policy expiring within 60 days and no renewal evidence.

**Re-check cadence:** Annual (insurance expiry) + at each contract renewal.

---

\newpage

## Geopolitical & regulatory (checks 9-12)

### Check 9: Sanctions and watchlist screening

**What to check:** Supplier legal entity, its owners (ultimate beneficial owners where available), and its directors do not appear on any applicable sanctions list.

**Source of truth:**
- OFAC SDN List (treasury.gov/ofac) — US
- EU Consolidated Financial Sanctions List (sanctionsmap.eu)
- UK Financial Sanctions (gov.uk/government/publications/financial-sanctions-consolidated-list-of-targets)
- UN Security Council Consolidated List
- For ongoing monitoring: paid services like Refinitiv World-Check, Dow Jones Risk Center, or Sanctions.io

**Red flag threshold:** Any exact or fuzzy match on legal entity, owners, or directors. Fuzzy matches require manual review — do not auto-clear on a "close but not exact" match.

**Re-check cadence:** Before PO, then monthly for panel suppliers. Sanctions lists update weekly; a supplier cleared in January can be listed in March.

---

### Check 10: Export control classification

**What to check:** For goods that might be dual-use (sensor electronics, certain machine tools, advanced materials, encryption-capable hardware), verify the supplier knows their export classification and can supply documentation for customs clearance.

**Source of truth:**
- EU Dual-Use Regulation Annex I classification
- US: Export Administration Regulations (EAR) ECCN number, or International Traffic in Arms (ITAR) USML category
- Self-declaration from supplier on their product data sheet, cross-checked against published BIS commodity classification

**Red flag threshold:** Supplier unable to produce the ECCN/EAR99 status for dual-use-capable goods; self-declaration of "EAR99" for goods that obviously include controlled components (semiconductors above specific compute thresholds, encryption above AES-256 keys, certain CNC machinery).

**Re-check cadence:** Per product on introduction; annual review for changes in product scope.

---

### Check 11: CBAM exposure (EU buyers, 2026+)

**What to check:** If you are an EU importer and the supplier is in a non-EU country producing iron/steel, aluminium, cement, fertilisers, electricity, or hydrogen, the Carbon Border Adjustment Mechanism applies from 2026. You need the supplier's embedded emissions data and a CBAM declaration capability.

**Source of truth:**
- European Commission CBAM guidance (taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en)
- Supplier's direct emissions data, verified by an accredited verifier per CBAM implementing regulations

**Red flag threshold:** Non-EU supplier in covered category with no CBAM awareness; no emissions data; no plan to provide verified emissions by 2026 definitive-period deadlines. The financial impact: expected CBAM cost for Chinese steel was estimated at €30-50/tonne in 2025 forecasts — factor this into landed cost comparison.

**Re-check cadence:** Semi-annual through 2026-2027 phase-in; annual once definitive.

---

### Check 12: Import tariff and country-of-origin verification

**What to check:** The declared country of origin matches the production reality, and current applicable tariff rates are built into the landed cost calculation. Country-of-origin fraud is a real risk when tariff differentials are high (for example US Section 301 tariffs on Chinese goods have led to mis-declared Vietnam origin).

**Source of truth:**
- Certificate of Origin from supplier, issued by chamber of commerce in production country
- HTS/CN code classification (your customs broker or the EU TARIC database: taxation-customs.ec.europa.eu/customs/customs-duties_en)
- Physical audit or supplier on-site visit confirms production happens at the declared facility

**Red flag threshold:** Supplier unwilling to provide Certificate of Origin; production address on quote differs from address on CoO; country of origin claimed is a common transshipment hub without matching production footprint (Malaysia, Vietnam, Mexico for certain categories).

**Re-check cadence:** Per shipment for high-risk categories; annual for stable low-risk supply.

---

\newpage

## ESG & compliance (checks 13-16)

### Check 13: Environmental management certification

**What to check:** ISO 14001 (environmental management system) or equivalent sector certification. Valid certificate, accredited issuing body, covering the producing facility.

**Source of truth:** Certificate PDF + verification on issuing body database. For high-regulation categories (chemicals, textiles), additional certifications matter: OEKO-TEX Standard 100 for textiles, GOTS for organic textiles, Responsible Wool Standard, RJC for jewellery, FSC for forestry.

**Red flag threshold:** No environmental certification for a category where your own customers ask for one; expired certificate; unaccredited issuing body.

**Re-check cadence:** Annual.

---

### Check 14: Scope 1 + 2 emissions disclosure

**What to check:** Does the supplier measure and report its own (Scope 1 direct + Scope 2 purchased energy) greenhouse gas emissions? For CSRD-subject buyers, your Scope 3 category 1 (purchased goods and services) requires supplier data.

**Source of truth:**
- Supplier's own sustainability report or annual report disclosure
- CDP (Carbon Disclosure Project) filings for suppliers who respond to CDP
- Direct supplier questionnaire for smaller suppliers

**Red flag threshold:** Supplier >100 employees with zero GHG measurement capability; suppliers in energy-intensive categories (metals, chemicals, ceramics) with no Scope 1+2 data by 2026; refusal to share data under NDA.

**Re-check cadence:** Annual (aligned with their fiscal-year disclosure cycle).

---

### Check 15: Social compliance audit

**What to check:** Evidence that the supplier's labour practices meet minimum international standards — no forced labour, no child labour, working-hour and pay conformance. Evidence is typically via a third-party audit (Sedex/SMETA, BSCI, SA8000, WRAP for textiles, or EcoVadis scorecard).

**Source of truth:** SMETA audit report (on the Sedex platform), BSCI audit rating (on amfori.org), EcoVadis scorecard (client portal access via the supplier). Direct audit for high-risk origins (Xinjiang for cotton, specific mining regions for minerals).

**Red flag threshold:**
- For textiles/apparel: no SMETA or BSCI within last 24 months; audit score "Needs Improvement" on critical categories (wages, health & safety)
- For minerals/metals: no Responsible Minerals Initiative (RMI) conformance or equivalent conflict-minerals due diligence
- Universal: refusal to participate in any social audit scheme

**Re-check cadence:** Annual; immediate re-audit on any credible allegation.

---

### Check 16: Anti-bribery and anti-corruption (ABAC)

**What to check:** Supplier has an anti-bribery policy, provides basic training to sales and commercial staff, and will accept the ABAC clauses in your standard supply agreement.

**Source of truth:** Supplier's ABAC policy document (often part of their Code of Conduct); signed acknowledgement of your ABAC clause; ISO 37001 certification for high-risk jurisdictions.

**Red flag threshold:** No ABAC policy at all; refusal to sign your ABAC clause; recent publicly-reported corruption case involving the supplier or its directors (Google the supplier name + "bribery" / "corruption" / "indictment" in the supplier's local language).

**Re-check cadence:** At contract signing; refresh at renewal.

---

\newpage

## Cyber & information security (checks 17-20)

### Check 17: Domain breach history

**What to check:** Has the supplier's email domain appeared in a publicly-known data breach? This is a crude signal but fast and free.

**Source of truth:** Have I Been Pwned (haveibeenpwned.com/DomainSearch) — requires domain ownership verification, or proxy via supplier's self-reported breach history.

**Red flag threshold:** Supplier domain appears in a major breach within the past 24 months and supplier cannot demonstrate post-breach remediation (password reset, MFA enforcement, credential rotation). Note: most domains have some breach exposure — the question is whether the supplier knew and responded.

**Re-check cadence:** At qualification; alerted via subscription services thereafter.

---

### Check 18: ISO 27001 or SOC 2 Type II

**What to check:** Does the supplier hold an information security management system certification proportional to the data they handle? For a metal stamping supplier who sees only purchase orders, ISO 27001 is overkill. For an electronics supplier with access to your product designs or a logistics supplier with your customer address book, it is not.

**Source of truth:**
- ISO 27001 certificate + accredited issuing body verification
- SOC 2 Type II report (annual, issued by a CPA firm) — provided under NDA
- For smaller suppliers: completed vendor security questionnaire (SIG Lite, CAIQ, or your own)

**Red flag threshold:** Category where supplier has access to PII, IP, or production systems + supplier has no ISO 27001, no SOC 2, and refuses to complete a security questionnaire = reject.

**Re-check cadence:** Annual; SOC 2 is annually renewed by design.

---

### Check 19: Multi-factor authentication enforcement

**What to check:** Does the supplier enforce multi-factor authentication on their email and any systems that touch your data? Credential stuffing and business email compromise (BEC) are the most common vectors, and MFA blocks both cheaply.

**Source of truth:** Direct question in security questionnaire, cross-checked by attempting a password-only login on their portal if they have one (confirm an MFA challenge appears).

**Red flag threshold:** Supplier commercial contact uses personal @gmail, @yahoo, @outlook for business communications; supplier admits no MFA on their email; past BEC incident disclosed.

**Re-check cadence:** At qualification; re-check if supplier changes email infrastructure.

---

### Check 20: Incident response and notification commitment

**What to check:** Does the supplier have a documented incident response plan, and will they commit contractually to notify you within 72 hours of a breach that could affect your data?

**Source of truth:** Supplier's IR plan summary; notification clause in your supply agreement (standard language: "Supplier shall notify Buyer within 72 hours of Supplier becoming aware of any data breach or security incident affecting Buyer's data or operations").

**Red flag threshold:** Refusal to accept 72-hour notification clause; no IR plan; supplier's answer to "who do I contact if you're breached" is a blank stare.

**Re-check cadence:** At contract signing; review at renewal.

---

\newpage

# Red-flag summary matrix

| # | Check | Auto-reject threshold |
|---|---|---|
| 1 | Legal entity | Mismatch between quoted name and registered entity |
| 2 | Financial stability | Credit score bottom quartile + recorded default in 24 months |
| 3 | Audited financials | Negative equity two consecutive years |
| 4 | Customer concentration | Single customer >60% of supplier revenue |
| 5 | ISO 9001 | Expired, wrong facility, or unaccredited issuer |
| 6 | Single-site risk | One facility + >75% utilisation + your PO displaces existing demand |
| 7 | PPM quality | >500 PPM commodity / >100 PPM safety-critical / no data despite ISO claim |
| 8 | Insurance + BCP | No product liability cover + no BCP |
| 9 | Sanctions screening | Any exact match on OFAC, EU, UK, UN lists |
| 10 | Export control | Dual-use goods without ECCN/classification |
| 11 | CBAM | Non-EU covered category + no emissions plan by 2026 |
| 12 | Origin verification | No CoO + origin country cannot be confirmed |
| 13 | ISO 14001 | Absent for regulated categories (chemicals, textiles) |
| 14 | Scope 1+2 | >100 employees, energy-intensive category, no GHG measurement |
| 15 | Social audit | No SMETA/BSCI/EcoVadis for textiles/apparel within 24 months |
| 16 | ABAC | No policy + refusal to sign clause |
| 17 | Breach history | Major breach <24 months + no remediation evidence |
| 18 | ISO 27001 / SOC 2 | Sensitive-data access + no cert + refused questionnaire |
| 19 | MFA | No MFA + past BEC disclosed |
| 20 | IR notification | Refuses 72-hour breach notification clause |

Any single auto-reject threshold triggers a "Do Not Approve" recommendation unless written remediation is accepted by the category director and procurement risk lead, in writing, with a re-review date within 90 days.

---

\newpage

# Re-check cadence template

| Check | New supplier | Panel supplier | Trigger-based re-check |
|---|---|---|---|
| 1. Legal entity | Before first PO | Annual | M&A, name change, restructuring announcement |
| 2. Financial stability | Before first PO | Annual | Missed delivery, supplier request for payment terms change, press reports |
| 3. Audited financials | Before first PO | Annual | Missed delivery, covenant breach signal |
| 4. Customer concentration | Before first PO | Annual | Large customer loss/gain |
| 5. ISO 9001 | Before first PO | Annual | Customer complaint spike |
| 6. Single-site | Before first PO | Annual | Expansion announcement, layoffs |
| 7. PPM | Quarterly from go-live | Quarterly | Complaint spike |
| 8. Insurance + BCP | Before first PO | Annual | Insurance market hardening, claim filed |
| 9. Sanctions | Before first PO | Monthly | New sanctions round announcement |
| 10. Export control | Per product | Annual | New product introduction |
| 11. CBAM | 2026-H1 | Semi-annual | EU CBAM regulation updates |
| 12. Origin | Per shipment (high-risk) | Annual | Tariff rule changes |
| 13. ISO 14001 | Before first PO | Annual | New ESG regulation |
| 14. Scope 1+2 | Before first PO | Annual | CDP annual cycle |
| 15. Social audit | Before first PO | Annual | Credible allegation |
| 16. ABAC | At contract signing | At renewal | New ABAC law, corruption reports |
| 17. Breach history | Before first PO | Ongoing via subscription | New breach disclosure |
| 18. ISO 27001 / SOC 2 | Before first PO | Annual | Scope change |
| 19. MFA | At qualification | Ad hoc | Email infrastructure change |
| 20. IR notification | At contract signing | At renewal | Contract template update |

### Monthly tasks (assign to one person, calendar block every first Tuesday)

- Sanctions screening refresh across all panel suppliers (check 9) — 20 minutes
- Review news alerts for panel suppliers (Google Alerts set to supplier name in local language) — 20 minutes

### Quarterly tasks

- PPM review for top 20 panel suppliers (check 7)
- Open-item list: suppliers in remediation, status update

### Annual tasks

- Full 20-point re-check for top 20 panel suppliers (80/20: these account for most risk exposure)
- Lighter 8-point re-check (1, 2, 5, 9, 13, 17, 18, 20) for the long tail

---

\newpage

# Printable one-page version

**Supplier:** _________________________________________
**Reviewer:** _________________________________________
**Date:** _____________   **Category:** _________________

## Financial (0-2 each, 8 max)

- [ ] 1. Legal entity verified
- [ ] 2. Credit score acceptable
- [ ] 3. Audited financials available or NDA'd
- [ ] 4. Customer concentration <40%

## Operational (0-2 each, 8 max)

- [ ] 5. ISO 9001 (or equivalent) current
- [ ] 6. No single-site / >75% util concern
- [ ] 7. PPM data available and within threshold
- [ ] 8. Product liability insurance + BCP

## Geopolitical (0-2 each, 8 max)

- [ ] 9. Sanctions screening clear
- [ ] 10. Export control classification confirmed
- [ ] 11. CBAM exposure documented (if applicable)
- [ ] 12. Country of origin verified

## ESG (0-2 each, 8 max)

- [ ] 13. ISO 14001 (or sector equivalent)
- [ ] 14. Scope 1+2 emissions disclosed
- [ ] 15. Social audit (SMETA/BSCI/EcoVadis) current
- [ ] 16. ABAC policy + clause accepted

## Cyber (0-2 each, 8 max)

- [ ] 17. No unresolved breach on domain
- [ ] 18. ISO 27001 / SOC 2 / questionnaire complete
- [ ] 19. MFA enforced
- [ ] 20. 72-hour IR notification clause accepted

**Total score:** ________ / 40

- 32-40: Approve
- 24-31: Conditional approval (remediation items list attached)
- <24: Reject, or escalate for exception approval

**Reviewer signature:** _____________________   **Date:** _______

**Category Director signature (for conditional/reject):** _____________________

---

## About this checklist

Published by Procurea, April 2026. Procurea is an AI-native supplier discovery and outreach platform — we find and verify 100-250 suppliers per campaign across 26 languages, so your 30-hour manual sourcing project becomes roughly 20 minutes of workflow plus the human judgement that this checklist protects.

This checklist is free to use, copy, and adapt to your organisation's SOP. No attribution required. If it saves you a painful incident, we'd love to hear about it — hello@procurea.io.

Next revision: October 2026.
