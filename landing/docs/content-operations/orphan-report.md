# Orphan Report — Blog Incoming-Link Map

> **Rule** (from `cross-linking-matrix.md §5`): every blog post must have ≥ 3 incoming internal links (blog-to-blog).
> **Date**: 2026-04-19
> **Methodology**: Parsed `src/content/blog-data/skeletons.ts` + `src/content/resources.ts` + `src/content/caseStudies.ts` and tallied references. Broken slug refs from resources/case studies are noted but excluded from inbound counts (they cannot reach their target).
> **Note**: Landing-page inbound links (e.g., `/features/ai-sourcing` → Post 10) are not represented in this data model. They live in feature-page CTAs and navbar links, which this audit does not count. Cross-linking-matrix.md §5 implicitly included them; this report counts **only measurable inbound references in content-data TypeScript files**.

---

## Full incoming-link map (sorted by inbound count)

| # | Post | Blog inbound | Total inbound | Status |
|---|---|---:|---:|---|
| 1 | `sourcing-funnel-explained` | 1 | 1 | **ORPHAN** |
| 2 | `buyers-guide-12-questions-ai-sourcing` | 1 | 1 | **ORPHAN** |
| 3 | `the-30-hour-problem` | 2 | 2 | **ORPHAN** |
| 4 | `netsuite-supplier-management` | 2 | 2 | **ORPHAN** |
| 5 | `sap-ariba-alternative-procurement` | 2 | 2 | **ORPHAN** |
| 6 | `salesforce-for-procurement` | 2 | 2 | **ORPHAN** |
| 7 | `german-manufacturer-sourcing` | 2 | 3 | **ORPHAN** (resource/case padding) |
| 8 | `tco-beat-lowest-price-trap` | 2 | 3 | **ORPHAN** (resource padding) |
| 9 | `rfq-comparison-template-buyers-use` | 2 | 4 | **ORPHAN** (resource padding) |
| 10 | `turkey-vs-poland-vs-portugal-textiles` | 3 | 3 | SAFE |
| 11 | `vat-vies-verification-3-minute-check` | 3 | 3 | SAFE |
| 12 | `supplier-database-stale-40-percent` | 3 | 4 | SAFE |
| 13 | `vendor-scoring-10-criteria` | 3 | 6 | SAFE |
| 14 | `china-plus-one-strategy` | 3 | 7 | SAFE |
| 15 | `european-nearshoring-guide-2026` | 4 | 4 | SAFE |
| 16 | `ai-procurement-software-7-features-2026` | 4 | 4 | SAFE |
| 17 | `supplier-risk-management-2026` | 4 | 5 | SAFE |
| 18 | `how-to-find-100-verified-suppliers-in-under-an-hour` | 5 | 5 | SAFE |
| 19 | `supplier-certifications-guide` | 5 | 8 | SAFE |
| 20 | `rfq-automation-workflows` | 7 | 8 | SAFE (hub-like concentration) |

**Summary**: 9 orphans / 20 posts (45% orphan rate). 5 of the 9 orphans rely on resource or case-study refs to bump their `total inbound` over 3, but for blog-to-blog pagerank flow they remain under the threshold.

Note: the 7 "broken slug references" counted in `launch-audit.md` are already excluded — they point at non-existent targets and don't flow pagerank anywhere. Fixing those broken refs to the correct slugs will add +7 inbounds to existing posts (see "fix side-effects" below).

---

## Per-post inbound detail

### ORPHAN-level posts

#### 1. `sourcing-funnel-explained` — 1 inbound
- Incoming:
  - `the-30-hour-problem` (blog)
- Related outgoing: `how-to-find-100-verified-suppliers-in-under-an-hour`, `the-30-hour-problem`, `rfq-automation-workflows`

#### 2. `buyers-guide-12-questions-ai-sourcing` — 1 inbound
- Incoming:
  - `ai-procurement-software-7-features-2026` (blog)
- Related outgoing: `ai-procurement-software-7-features-2026`, `how-to-find-100-verified-suppliers-in-under-an-hour`, `supplier-risk-management-2026`

#### 3. `the-30-hour-problem` — 2 inbound
- Incoming:
  - `how-to-find-100-verified-suppliers-in-under-an-hour` (blog)
  - `sourcing-funnel-explained` (blog)

#### 4. `netsuite-supplier-management` — 2 inbound
- Incoming:
  - `sap-ariba-alternative-procurement` (blog)
  - `salesforce-for-procurement` (blog)

#### 5. `sap-ariba-alternative-procurement` — 2 inbound
- Incoming:
  - `netsuite-supplier-management` (blog)
  - `salesforce-for-procurement` (blog)

#### 6. `salesforce-for-procurement` — 2 inbound
- Incoming:
  - `netsuite-supplier-management` (blog)
  - `sap-ariba-alternative-procurement` (blog)

#### 7. `german-manufacturer-sourcing` — 2 blog + 1 case-study
- Incoming:
  - `european-nearshoring-guide-2026` (blog)
  - `turkey-vs-poland-vs-portugal-textiles` (blog)
  - `event-agency-barcelona-72h` (case study, currently broken ref — once fixed will still be a case-study inbound not blog-inbound)

#### 8. `tco-beat-lowest-price-trap` — 2 blog + 1 resource
- Incoming:
  - `rfq-comparison-template-buyers-use` (blog)
  - `china-plus-one-strategy` (blog)
  - `tco-calculator` (resource)

#### 9. `rfq-comparison-template-buyers-use` — 2 blog + 2 resources
- Incoming:
  - `rfq-automation-workflows` (blog)
  - `vendor-scoring-10-criteria` (blog)
  - `rfq-comparison-template` (resource)
  - `vendor-scoring-framework` (resource)

### SAFE-level posts

#### 10. `turkey-vs-poland-vs-portugal-textiles` — 3 inbound
- `european-nearshoring-guide-2026`, `german-manufacturer-sourcing`, `china-plus-one-strategy`

#### 11. `vat-vies-verification-3-minute-check` — 3 inbound
- `supplier-risk-management-2026`, `supplier-certifications-guide`, `supplier-database-stale-40-percent`

#### 12. `supplier-database-stale-40-percent` — 3 blog + 1 resource
- `vat-vies-verification-3-minute-check`, `supplier-risk-management-2026`, `supplier-certifications-guide`, `supplier-risk-checklist-2026` (resource)

#### 13. `vendor-scoring-10-criteria` — 3 blog + 2 resources + 1 case
- `rfq-automation-workflows`, `rfq-comparison-template-buyers-use`, `tco-beat-lowest-price-trap`, `rfq-comparison-template` (resource), `vendor-scoring-framework` (resource), `hvac-subcontractors-developer` (case)

#### 14. `china-plus-one-strategy` — 3 blog + 2 resources + 2 cases
- `european-nearshoring-guide-2026`, `turkey-vs-poland-vs-portugal-textiles`, `tco-beat-lowest-price-trap`, `tco-calculator` (resource), `nearshore-migration-playbook` (resource), `automotive-8-suppliers-5-days` (case), `d2c-cosmetics-nearshore-migration` (case)

#### 15. `european-nearshoring-guide-2026` — 4 inbound
- `how-to-find-100-verified-suppliers-in-under-an-hour`, `turkey-vs-poland-vs-portugal-textiles`, `german-manufacturer-sourcing`, `china-plus-one-strategy`

#### 16. `ai-procurement-software-7-features-2026` — 4 inbound
- `netsuite-supplier-management`, `sap-ariba-alternative-procurement`, `salesforce-for-procurement`, `buyers-guide-12-questions-ai-sourcing`

#### 17. `supplier-risk-management-2026` — 4 blog + 1 resource
- `vat-vies-verification-3-minute-check`, `supplier-certifications-guide`, `supplier-database-stale-40-percent`, `buyers-guide-12-questions-ai-sourcing`, `supplier-risk-checklist-2026` (resource)

#### 18. `how-to-find-100-verified-suppliers-in-under-an-hour` — 5 inbound
- `the-30-hour-problem`, `rfq-automation-workflows`, `ai-procurement-software-7-features-2026`, `sourcing-funnel-explained`, `buyers-guide-12-questions-ai-sourcing`

#### 19. `supplier-certifications-guide` — 5 blog + 2 resource + 1 case
- `vat-vies-verification-3-minute-check`, `supplier-risk-management-2026`, `german-manufacturer-sourcing`, `vendor-scoring-10-criteria`, `supplier-database-stale-40-percent`, `supplier-risk-checklist-2026` (resource), `vendor-scoring-framework` (resource), `restaurant-chain-12-vendors` (case)

#### 20. `rfq-automation-workflows` — 7 blog + 1 resource (hub-like)
- `how-to-find-100-verified-suppliers-in-under-an-hour`, `the-30-hour-problem`, `ai-procurement-software-7-features-2026`, `rfq-comparison-template-buyers-use`, `vendor-scoring-10-criteria`, `tco-beat-lowest-price-trap`, `sourcing-funnel-explained`, `rfq-comparison-template` (resource)

---

## Top 5 orphan risks (prioritized)

1. **`sourcing-funnel-explained`** (1 inbound) — AI Sourcing pillar spoke; should be deeply referenced by hub posts. Only 30-hour-problem links to it. Any post about "supplier discovery" or "conversion rate" should include it.

2. **`buyers-guide-12-questions-ai-sourcing`** (1 inbound) — BOFU vendor-evaluation post; should be the MOFU/BOFU crown of the AI Sourcing pillar. Only ai-procurement-software-7-features links in. Every TOFU post in that pillar should end with a "next step" link to this one.

3. **`the-30-hour-problem`** (2 inbound) — arguably the most shareable flagship narrative. Should be referenced by every MOFU/BOFU post that invokes ROI. Currently only 2 posts link here.

4. **`netsuite-supplier-management` / `sap-ariba-alternative-procurement` / `salesforce-for-procurement`** (ERP cluster, all at 2 inbound) — cross-linking-matrix.md §8 Risk 1 already flagged this cluster. They reference each other (2 inbound each from the other two ERP posts), but no other cluster links in. Need bridges from at least `how-to-find-100-verified-suppliers-in-under-an-hour` and `ai-procurement-software-7-features-2026`.

5. **`german-manufacturer-sourcing`** (2 blog inbound) — multilingual pillar spoke, but only 2 blog inbounds (European nearshoring + Turkey textiles). Same pattern as #4: pillar-internal loop without cross-cluster bridges.

---

## Suggested fixes

### Minimal fix — bring 9 orphans to 3+ blog inbound

**12 reciprocal links total** (some fixes kill two birds):

| Change in post | Add to `relatedPosts` | Fixes orphan |
|---|---|---|
| `china-plus-one-strategy` (line ~330 in `skeletons.ts`) | add `sourcing-funnel-explained` | #1 sourcing-funnel |
| `ai-procurement-software-7-features-2026` (line ~216) | add `sourcing-funnel-explained` | #1 sourcing-funnel |
| `rfq-automation-workflows` (line ~129) | add `buyers-guide-12-questions-ai-sourcing` | #2 buyer's guide |
| `supplier-risk-management-2026` (line ~244) | add `buyers-guide-12-questions-ai-sourcing` | #2 buyer's guide |
| `ai-procurement-software-7-features-2026` (line ~216) | add `the-30-hour-problem` | #3 30-hour (replaces existing?) |
| `supplier-database-stale-40-percent` (line ~418) | add `the-30-hour-problem` | #3 30-hour |
| `how-to-find-100-verified-suppliers-in-under-an-hour` (line ~43) | add `sap-ariba-alternative-procurement` | #5 SAP |
| `ai-procurement-software-7-features-2026` (line ~216) | add `netsuite-supplier-management` | #4 NetSuite |
| `buyers-guide-12-questions-ai-sourcing` (line ~587) | add `salesforce-for-procurement` | #6 Salesforce |
| `china-plus-one-strategy` (line ~330) | add `german-manufacturer-sourcing` | #7 German |
| `vendor-scoring-10-criteria` (line ~359) | add `tco-beat-lowest-price-trap` | (already linked — confirm) |
| `supplier-certifications-guide` (line ~388) | add `rfq-comparison-template-buyers-use` | #9 RFQ template |

Note: many posts only have 3 entries in `relatedPosts`. Expanding to 4-5 per post is fine; the UI typically shows "Related content" in a 3-card grid but extra entries can power "You might also like" strips.

### Fix side-effects from `launch-audit.md` RED items

When the 3 broken slug refs in `resources.ts` and 7 broken slug refs in `caseStudies.ts` get fixed (per launch-audit.md), the following posts gain **additional** (non-blog) inbound links:

- `european-nearshoring-guide-2026` → +1 resource inbound (tco-calculator), +1 resource (nearshore-migration-playbook), +2 case (automotive, d2c)
- `turkey-vs-poland-vs-portugal-textiles` → +1 resource (nearshore-migration-playbook), +1 case (d2c)
- `how-to-find-100-verified-suppliers-in-under-an-hour` → +4 case inbounds (automotive, event, hvac, restaurant)

These don't affect blog-to-blog orphan math but do strengthen topic authority for search.

### Long-term: build landing-page inbound links (matrix §5 assumption)

cross-linking-matrix.md §5 counted `/features/ai-sourcing` and `/integrations/sap` as inbound links. Those landing pages exist but do NOT currently render a "Related blog posts" strip linking to the cluster posts. Post-MVP Wave 2 task: add `RelatedContentGrid` to each feature landing page referencing 3 blog posts from its pillar. That alone adds ~40 inbound links across the 10 feature pages, fully eliminating orphan risk.

---

## Monitoring cadence

Per cross-linking-matrix.md §9: Friday audit. Add to CMM weekly checklist:
1. Re-run `scripts/audit-content-refs.mjs` (if created) or equivalent manual grep.
2. Any post at <3 blog inbounds flags as orphan risk.
3. Any broken slug ref (from future content drift) is a RED SLA-24h fix.
