# Why 40% of Your Supplier Database Goes Stale Every Year (And What to Do)

## Metadata
- **Slug:** supplier-master-data-quality-40-percent-stale
- **Pillar:** Supplier Intelligence & Compliance
- **Persona:** P2 — Purchasing Manager (with P1 read-through)
- **Funnel:** TOFU
- **Primary KW:** supplier master data quality
- **Word count target:** 1600
- **Publish wave:** 3

## Target reader profile
A Purchasing Manager or procurement ops analyst who just inherited a 1500-row Excel or SAP LFA1 supplier master. 30% of emails bounce, 15% of phone numbers are dead, company names don't match current entities, and nobody has ever done a cleanup. She needs a low-effort way to triage.

## Success metric
- 8+ clicks per week to `/features/company-registry` after month 1.
- 20+ "audit your supplier database" CTA clicks in 60 days.
- Ranking top 20 for "supplier master data quality" within 120 days.

## Primary CTA
"Audit your supplier database — upload a CSV, we flag duplicates, stale records, bounced emails, and VAT mismatches. Free up to 1000 rows."

## Internal link targets (3 mandatory)
- Feature page: `/features/company-registry`
- Industry page: `/industries/manufacturing`
- Related post or lead magnet: `/blog/supplier-risk-management-checklist-2026`

## Copy angle (1 sentence)
Supplier master data decay is a known problem — this post explains the 5 decay vectors (M&A, deregistration, email rotation, cert expiry, contact churn) with typical annual rates and gives a 4-hour weekend triage workflow for a 1000-row master.

## Must-include elements
- The 40% claim source: break it down — ~10% M&A/ownership changes, ~8% deregistrations/bankruptcies, ~12% primary-contact email changes (LinkedIn turnover), ~5% certification expirations, ~5% address/phone changes. Cite Gartner / Dun & Bradstreet supplier data decay benchmarks.
- A 4-step weekend triage: (1) bulk VAT/registry check → flag deregistered, (2) email validation → flag bounced, (3) duplicate detection on company name fuzzy match, (4) certification expiry check on top 50 suppliers by spend.
- Pareto framing: don't clean all 1500 rows. Clean the top 100 by spend (which is typically 80% of spend) — takes a day, not a month.
- Decision framework: delete vs. archive vs. re-enrich. Criteria for each.
- The ongoing-hygiene model: monthly 30-min job (new additions sanity check), quarterly 2-hour job (top-100 re-verify), annual 1-day job (full sweep).
- Common mistakes: deleting based on "no activity" (some strategic suppliers are inactive on purpose), trusting supplier self-updates (they forget), merging duplicates without checking Info Records in ERP (breaks history).

## Out of scope
- ERP-specific master data governance (SAP MDG is not our lane, one-line mention).
- Full data-quality tooling comparison (Informatica, Collibra — we're procurement audience).
- Legal/GDPR side of deleting supplier contacts (one-paragraph callout, link out).
