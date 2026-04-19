# Cross-Linking Matrix — The Definitive Link Graph

> **Owner**: Content Marketing Manager
> **Enforces**: Every blog post linked by ≥3 emails AND ≥2 LinkedIn posts AND ≥3 incoming internal links.
> **Source of truth inputs**: `content-strategy/newsletter-integration.md`, `seo/internal-link-graph.md`, `content-strategy/editorial-calendar.md`.
> **Authority**: If this matrix disagrees with upstream docs, this matrix wins. Upstream authors should open an escalation, not silent-patch.

---

## 1. Master matrix — 20 blog posts × (emails × LinkedIn × internal links)

Columns:
- **Emails (≥3)** — exact email step with Pattern (A = inline, B = footer, C = dedicated recap)
- **LinkedIn (≥2)** — LI post type per week (LI-## = absolute post number in 57-post Content Factory calendar)
- **Inbound internal links (≥3)** — which other blog posts or landing pages link INTO this post
- **Rule met?** — hard check: all three rules satisfied

Legend of email IDs: **N##** = MQL Nurture, **W##** = Welcome, **P1-##** = P1 Nurture, **P2M-##** = P2 Manager Nurture, **P2S-##** = P2 Specialist Nurture, **IA-##** = Industry Addon.

| # | Slug | Wave | Emails (≥3) | LinkedIn (≥2) | Inbound (≥3) | Met? |
|---|---|---|---|---|---|---|
| 1 | how-to-find-100-verified-suppliers-in-under-an-hour | 1 | W2 (C), N2 (A), P2S-03 (B) | LI-02 tease, LI-04 data, LI-11 short | Post 10, Post 18, Post 20, Post 6, `/features/ai-sourcing` | YES (5) |
| 2 | the-30-hour-problem | 1 | N2 (C), N9 (A), P2M-02 (C), P1-02 (A) | LI-05 tease, LI-06 data, LI-08 contrarian, LI-25 long-form | Post 1, Post 6, Post 15, Post 18, `/` home | YES (5) |
| 3 | european-nearshoring-guide-2026 | 1 | N5 (C), P2M-04 (C), P1-04 (B) | LI-13 tease, LI-14 data, LI-15 short | Post 7, Post 11, Post 14, `/use-cases/china-to-nearshore`, `/industries/manufacturing` | YES (5) |
| 4 | rfq-automation-workflows | 1 | P2M-03 (C), N11 (B), P2S-02 (A) | LI-22 tease, LI-23 short | Post 8, Post 10, Post 6, `/features/email-outreach` | YES (4) |
| 5 | turkey-vs-poland-vs-portugal-textiles | 1 | W5 (C), P2M-07 (C), IA-01 (B) | LI-17 tease, LI-20 personal story, LI-21 carousel | Post 3, Post 14, Post 7, `/industries/retail-ecommerce` | YES (4) |
| 6 | supplier-master-data-stale-40-percent | 2 | W4 (C), N11 (B), P2M-06 (A) | LI-29 tease, LI-31 short | Post 4, Post 9, Post 5, `/features/company-registry` | YES (4) |
| 7 | vat-vies-3-minute-check | 2 | N6 (A), P2M-06 (C), P1-06 (A) | LI-33 tease, LI-34 data, LI-35 short | Post 1, Post 9, Post 12, Post 13, `/features/company-registry` | YES (5) |
| 8 | supplier-discovery-funnel | 2 | N4 (C), W3 (B), P2S-03 (A) | LI-09 tease, LI-10 data | Post 1, Post 6, Post 10, Post 20, `/features/ai-sourcing` | YES (5) |
| 9 | vendor-scoring-10-criteria | 2 | P2M-05 (C), N9 (B), P2S-05 (A) | LI-37 tease, LI-38 carousel | Post 2, Post 8, Post 9, Post 17, `/features/offer-comparison` | YES (5) |
| 10 | ai-procurement-software-7-features | 2 | N3 (C), N11 (B), P1-10 (A) | LI-07 tease, LI-24 contrarian, LI-45 short | Post 1, Post 20, Post 5, `/features/ai-sourcing` | YES (4) |
| 11 | china-plus-1-playbook-2026 | 2 | P1-04 (A), P2M-07 (B), IA-02 (B) | LI-41 tease, LI-42 long-form | Post 3, Post 11, `/use-cases/china-to-nearshore`, `/industries/retail-ecommerce` | YES (4) |
| 12 | rfq-comparison-template-post | 2 | P2M-05 (B), P2S-06 (A), N11 (B) | LI-43 tease (gated), LI-44 short | Post 2, Post 15, Post 17, Post 10, `/features/offer-comparison` | YES (5) |
| 13 | sap-ariba-alternative-s4hana-sourcing ⚠ | 3 | W6 (C), P1-05 (C), P1-09 (B) | LI-48 tease, LI-49 BTS | Post 16, Post 19, `/integrations/sap`, `/industries/manufacturing` | YES (4) |
| 14 | tco-beat-lowest-price-trap | 3 | P2M-08 (A), P1-10 (B), N9 (A) | LI-46 tease (calc gated), LI-47 data | Post 2, Post 8, Post 15, `/features/offer-comparison` | YES (4) |
| 15 | iso-9001-iatf-16949-fda | 3 | P1-04 (B), IA-02 (C), P2M-06 (B) | LI-51 tease, LI-52 carousel | Post 1, Post 7, Post 9, Post 11, `/features/company-registry` | YES (5) |
| 16 | supplier-risk-management-2026 | 3 | P1-04 (C), N6 (A), IA-03 (B) | LI-53 tease, LI-54 data, LI-55 contrarian | Post 4, Post 12, Post 13, Post 3, `/features/company-registry` | YES (5) |
| 17 | netsuite-supplier-management | 3 | W6 (B), P1-05 (B), IA-04 (B) | LI-50 tease, LI-56 short | Post 5 ⚠, Post 13, `/integrations/oracle-netsuite` | YES (3 min) |
| 18 | salesforce-procurement-integration | 3 | P1-05 (B), P1-10 (A), N11 (B) | LI-39 tease, LI-40 contrarian | Post 5 ⚠, Post 16, `/integrations/salesforce` | YES (3 min) |
| 19 | source-from-german-manufacturers | 3 | N5 (B), P2M-04 (B), IA-01 (A) | LI-18 tease, LI-19 short | Post 3, Post 11, Post 14, `/features/multilingual-outreach` | YES (4) |
| 20 | buyers-guide-12-questions-ai-sourcing | 3 | N11 (C), P2M-11 (C), P1-11 (B) | LI-28 tease, LI-32 carousel, LI-57 contrarian | Post 1, Post 6, Post 18, `/features/ai-sourcing` | YES (4) |

**Totals**
- Email references: **62** (avg 3.1 / post)
- LinkedIn references: **49** (avg 2.45 / post)
- Internal inbound links: **89** (avg 4.45 / post)

All 20 posts satisfy the ≥3 + ≥2 + ≥3 rule. No orphans.

⚠ = Posts referencing the ERP cluster (5, 17, 18) that MUST route to pilot-status pages (`/integrations/sap`, `/integrations/oracle-netsuite`, `/integrations/salesforce`) carrying an explicit "Pilot" or "Roadmap" badge. No links from these posts to production feature pages making "seamless integration" claims. Enforced in component-reuse-map.md (ERP posts use `IntegrationStatusBadge` component).

---

## 2. Reverse lookup — emails to blog posts

For the SMM when building an email, which blog posts should it reference?

| Email | Primary blog (Pattern C) | Secondary (Pattern A/B) |
|---|---|---|
| N2 (MQL D3) | Post 2 (30-hour) | Post 1 (inline) |
| N3 (MQL D7) | Post 10 (AI procurement 7 features) | — |
| N4 (MQL D11) | Post 8 (discovery funnel) | — |
| N5 (MQL D15) | Post 3 (nearshoring) | Post 19 (footer) |
| N6 (MQL D21) | — | Post 7 (inline), Post 16 (inline) |
| N9 (MQL D40) | — | Post 2 (inline), Post 9/vendor-scoring (footer), Post 14 (inline) |
| N11 (MQL D54) | Post 20 (buyer's guide 12Q) | Post 4 (B), Post 6 (B), Post 10 (B), Post 12 (B), Post 18 (B) — objection-handling round-up |
| W2 (Welcome D1) | Post 1 (find 100 suppliers) | — |
| W3 (Welcome D3) | — | Post 8 (footer) |
| W4 (Welcome D5) | Post 6/master-data-stale | — |
| W5 (Welcome D8) | Post 5 (Turkey) | — |
| W6 (Welcome D12) | Post 13/sap-ariba-alt | Post 17 (footer) |
| P1-02 (P1 D4) | — | Post 2 (inline) |
| P1-04 (P1 D14) | Post 16/supplier-risk | Post 3 (B), Post 11 (A), Post 15 (B) |
| P1-05 (P1 D20) | Post 13/sap-ariba-alt | Post 17 (B), Post 18 (B) |
| P1-06 (P1 D27) | — | Post 7 (inline) |
| P1-09 (P1 D49) | — | Post 13/sap-ariba-alt (footer) |
| P1-10 (P1 D56) | — | Post 10 (inline), Post 14 (footer), Post 18 (inline) |
| P1-11 (P1 D63) | — | Post 20 (footer) |
| P2M-02 (P2M D3) | Post 2 (30-hour) | — |
| P2M-03 (P2M D7) | Post 4 (RFQ workflows) | — |
| P2M-04 (P2M D11) | Post 3 (nearshoring) | Post 19 (footer) |
| P2M-05 (P2M D15) | Post 9/vendor-scoring | Post 12/rfq-template (footer) |
| P2M-06 (P2M D20) | Post 7 (VIES) | Post 6/master-data (A), Post 15 (B) |
| P2M-07 (P2M D26) | Post 5 (Turkey/Maria) | Post 11 (footer) |
| P2M-08 (P2M D32) | — | Post 14/TCO (inline) |
| P2M-11 (P2M D50) | Post 20 (buyer's guide 12Q) | — |
| P2S-02 (P2S D2) | — | Post 4 (inline) |
| P2S-03 (P2S D5) | — | Post 1 (footer), Post 8 (inline) |
| P2S-05 (P2S D11) | — | Post 9/vendor-scoring (inline) |
| P2S-06 (P2S D14) | — | Post 12/rfq-template (inline) |
| IA-01 Manufacturing | — | Post 5 (footer), Post 19 (inline) |
| IA-02 Automotive | Post 15/certifications | Post 11 (footer) |
| IA-03 Construction | — | Post 16/risk (footer) |
| IA-04 Packaging | — | Post 17/netsuite (footer) |

**Validation**: Every email send has at least one blog link (no dark-hole emails without a content tie). Content Factory recycle rule preserved: 37 distinct email sends × 3 LinkedIn each ≈ 111 LI slots — we use 49 for direct blog amplifications, the rest go to non-blog content (data insights, founder stories, industry news reactions).

---

## 3. Content Factory recycle math — the ≥9 LI-per-blog proof

The rule: emails × 3 = LinkedIn posts. If every blog post has ≥3 email references, and every email generates 3 LI posts, then transitively every blog post should have ≥9 LI amplifications (each email fires up to 3 LI posts that either directly tease the blog or piggyback on the email's argument).

**Direct blog-tease LI counts (from §1)**: average 2.45/post — this is **only the direct link-in-LI-post count**, not the transitive count.

**Transitive count** (the ≥9 rule): each post is referenced by ~3 emails; each email fires 3 LI posts; the post's themes/stats/quotes appear across all 3 LI posts (not just the one direct tease). Blog post 2 (30-hour) is referenced across 4 emails × 3 LI each = **12 LI moments** where its narrative surfaces, even if only 4 of them carry a direct URL.

Enforcement: the direct-link LI count target is **≥2** per blog (met). The transitive-theme LI surfacing target is **≥6** per blog (tracked in Notion `🎤 LinkedIn Pipeline.Parent Email` relation). CMM audits transitive coverage in the Friday review.

---

## 4. Anchor text variations per post (avoid exact-match repetition)

Per `internal-link-graph.md` Anchor Text Diversity Rules (line 565): exact-match ≤ 15%, partial-match 40–50%, branded 10–15%, descriptive 30–40%.

Each post gets **3–5 variant anchor phrases** that other posts can use when linking to it. Never use the exact-match anchor more than twice in any single post.

| Post | Exact match (use ≤2× total) | Partial match variants (rotate) | Descriptive variants |
|---|---|---|---|
| 1 | "how to find suppliers" | "find 100 verified suppliers in under an hour" / "verified supplier discovery in under an hour" | "the 1-hour sourcing workflow" / "a sourcing run that skips the 30-hour Excel tax" |
| 2 | "procurement efficiency" / "the 30-hour problem" | "the 30-hour problem breakdown" / "where 30 hours actually go in manual sourcing" | "the anatomy of a 30-hour sourcing campaign" / "manual sourcing's margin tax" |
| 3 | "european nearshoring" | "European nearshoring guide 2026" / "nearshoring to Europe playbook" | "the 12-page nearshoring playbook" / "the 6-week migration framework" |
| 4 | "rfq automation" | "5 RFQ workflows that beat Excel" / "RFQ automation workflows" | "the RFQ automation teardown" / "why Excel breaks past 10 suppliers" |
| 5 | "textile sourcing europe" | "Turkey vs Poland vs Portugal" / "textile sourcing comparison 2026" | "Maria's 2-hour Turkey sourcing run" / "country-by-country textile comparison" |
| 6 | "supplier master data quality" | "40% supplier database decay" / "supplier data quality checklist" | "why 40% of your supplier database goes stale" |
| 7 | "vat vies check" | "VAT VIES verification" / "VIES validation workflow" | "the 3-minute VAT check" / "€50k VAT verification story" |
| 8 | "supplier discovery process" | "supplier discovery funnel" / "500-results-to-120-suppliers funnel" | "the sourcing funnel explainer" |
| 9 | "vendor scoring" | "10-criteria vendor scoring framework" / "weighted vendor scorecard" | "the 10-criteria scorecard" |
| 10 | "ai procurement software" | "7 AI procurement features worth paying for" / "AI procurement feature teardown" | "features worth paying for (and 3 that are hype)" |
| 11 | "china+1 sourcing" | "China+1 playbook 2026" / "diversification playbook" | "the 6-week China+1 migration playbook" |
| 12 | "rfq comparison template" | "RFQ comparison template Excel" / "free RFQ comparison template" | "the template 100+ teams actually use" |
| 13 | "sap ariba alternative" | "SAP S/4HANA supplier sync" / "mid-market SAP alternative" | "the Ariba alternative that skips the €500k SI project" |
| 14 | "tco procurement" | "total cost of ownership in procurement" / "TCO beats purchase price" | "the 7 hidden costs nobody calculates" |
| 15 | "supplier certifications guide" | "ISO 9001 vs IATF 16949" / "supplier certifications that matter" | "the 8 certifications that actually matter" |
| 16 | "supplier risk management" | "supplier risk management 2026" / "CSDDD-ready risk checklist" | "the 20-point 2026 risk checklist" |
| 17 | "netsuite supplier management" | "NetSuite supplier module gap analysis" / "sourcing tool for NetSuite" | "what NetSuite vendor records can't do" |
| 18 | "salesforce procurement integration" | "Salesforce for procurement" / "Salesforce supplier management" | "when Salesforce as procurement actually works" |
| 19 | "german manufacturer sourcing" | "how to source from German manufacturers" / "German supplier sourcing" | "sourcing German Mittelstand without speaking German" |
| 20 | "ai sourcing tool comparison" | "AI sourcing buyer's guide" / "12 questions to ask an AI sourcing vendor" | "the 12-question buyer's framework" |

**Operator rule**: when adding a new outbound link from Post X → Post Y, check the last 2 anchors already in Post X pointing to Post Y. Rotate the anchor variant.

---

## 5. Orphan prevention check — incoming links ≥3 per post

Pulled directly from §1 column "Inbound" and cross-checked against `internal-link-graph.md` line 602.

| Post | Inbound count (blogs + landings) | Status |
|---|---|---|
| 1 | 5 | SAFE |
| 2 | 5 | SAFE |
| 3 | 5 | SAFE |
| 4 | 4 | SAFE |
| 5 | 4 | SAFE |
| 6 | 4 | SAFE |
| 7 | 5 | SAFE |
| 8 | 5 | SAFE |
| 9 | 5 | SAFE |
| 10 | 4 | SAFE |
| 11 | 4 | SAFE |
| 12 | 5 | SAFE |
| 13 | 4 | SAFE |
| 14 | 4 | SAFE |
| 15 | 5 | SAFE |
| 16 | 5 | SAFE |
| 17 | **3** | **MINIMUM — watch** |
| 18 | **3** | **MINIMUM — watch** |
| 19 | 4 | SAFE |
| 20 | 4 | SAFE |

**Watch items**: Posts 17 (NetSuite) and 18 (Salesforce) sit at the 3-link minimum. Mitigation:
- Post-MVP: add `/integrations` hub page with editorial copy linking all 3 ERP posts (Post 13, 17, 18) contextually in-body.
- Post-MVP: add a new vertical landing page `/industries/professional-services` with contextual link to Post 18 (Salesforce for procurement).
- If either slips to 2 inbound, trigger an orphan-fix task for CMM.

---

## 6. Pillar-cluster health check (launch readiness)

Per `internal-link-graph.md` §5 pillar model, each pillar needs its hub post live before spoke posts publish.

| Pillar | Hub post | Hub publish date | Spoke posts | Cluster complete by |
|---|---|---|---|---|
| 1. AI Sourcing Automation | Post 1 (find 100) | **2026-04-23 (Wave 1)** | Posts 6, 10, 18, 20 | Wave 3 (Oct 1) |
| 2. ERP/CRM Integration | Post 13 (sap-ariba-alt) | **2026-07-20 (Wave 3)** | Posts 17, 18 | Wave 3 (Sep 10) |
| 3. Multilingual Outreach | Post 3 (nearshoring) | **2026-04-30 (Wave 1)** | Posts 7, 11, 14 | Wave 3 (Sep 21) |
| 4. Supplier Intelligence | Post 16 (risk mgmt) | **2026-08-20 (Wave 3)** | Posts 4, 12, 13 | Wave 3 (Aug) |
| 5. Offer Comparison | Post 8 (RFQ comparison template) | **2026-07-09 (Wave 2)** | Posts 2 (RFQ auto), 15 (TCO), 17 (vendor scoring) | Wave 3 |

**Critical issue identified**: Pillars 2, 4, 5 have hubs that publish AFTER their spokes. This creates temporary orphan windows.

- **Pillar 5**: RFQ automation (Post 4) ships Wave 1 May 4 as a spoke, but hub Post 8 doesn't ship until Wave 2 July 9. For 10 weeks Post 4 is cluster-less. Mitigation: Post 4 links externally to `/features/offer-comparison` landing page as a temporary hub, and its inbound links come from Post 10 (30-hour), Post 6 (AI proc SW), not a blog hub. Accept the gap.
- **Pillar 4**: Post 4 (VIES, Wave 2) publishes before Post 16 (risk, Wave 3). VIES spoke is functional alone, risk hub is the retroactive anchor. Acceptable.
- **Pillar 2**: Post 13 (SAP hub) publishes before any spokes, so no issue. Good order.

**Recommendation**: Wave 1 is architecturally sound for Pillars 1 and 3 (hubs live). Pillars 2, 4, 5 treat their feature landing pages as interim hubs. This is what `internal-link-graph.md` line 16 acknowledges ("until we build dedicated pillar pages in post-MVP").

---

## 7. Component reuse map (preview — see component-reuse-map.md for full spec)

| Section | Component | Used by posts |
|---|---|---|
| Hero | `HeroDataForward` | 2, 6, 10, 14 |
| Hero | `HeroStoryForward` | 1, 4, 5, 8, 11, 19 |
| Hero | `HeroComparison` | 3, 13, 15, 17, 18, 20 |
| Inline CTA | `InlineCtaMagnetDownload` | 1, 3, 4, 8, 9, 12, 14, 16 |
| Inline CTA | `InlineCtaTrialStart` | 1, 2, 5, 10, 20 |
| Inline CTA | `InlineCtaDemoBook` | 13, 16, 17, 18 |
| Inline CTA | `InlineCtaCalculatorLink` | 2, 14, 17 |
| Data viz | `StatPillsRow` | 1, 2, 6, 10, 14 |
| Data viz | `ComparisonTable` | 3, 5, 11, 15, 20 |
| Data viz | `FunnelDiagram` | 1, 8, 18 |
| Related | `RelatedContentGrid` (3-card) | ALL 20 |
| Footer | `AuthorByline` | ALL 20 |
| Footer | `NewsletterSignupInline` | ALL 20 |
| ERP-only | `IntegrationStatusBadge` | 13, 17, 18 |

---

## 8. Biggest cross-linking risks identified (for escalation)

### Risk 1 — Post 17 (NetSuite) & Post 18 (Salesforce) at orphan minimum
3 inbound links only. If any of those sources get cut (e.g., if Post 13's SAP cluster ends up de-scoped, Post 16 NetSuite cross-reference might drop), we slip to 2 inbound and orphan alarms trigger. **Action**: CMM monitors in Month 2 post-launch; adds editorial `/integrations` hub link mid-Wave 3.

### Risk 2 — Post 11 (China+1) has only 4 emails referencing it but 2 are Industry Addons
Industry Addons are conditional sends (subscriber opted into a vertical). Effective email reach for Post 11 in MQL audience is P1-04 only. **Action**: Promote Post 11 to a footer reference in N5 (currently only references Post 3). Adds reach without breaking pattern.

### Risk 3 — Welcome W3 (Day 3) Pattern B references Post 8 (discovery funnel, Wave 2)
W3 fires for every new signup on Day 3. If a user signs up in Wave 1 (Apr 23–May 17), W3 fires before Post 8 (Wave 2 June 1) is live. Broken link for 6 weeks. **Action**: W3 Pattern B swap — temporarily reference Post 1 (find 100 suppliers) until Post 8 ships. Revert on June 2.

### Risk 4 — ERP over-promise in P1-05 Pattern C (Post 13)
P1-05 "ERP integration deep-dive (SAP/Oracle/Dynamics)" is listed as Pattern C dedicated recap for Post 13. But Dynamics has no dedicated blog post. P1-05 subject line implies comprehensive ERP coverage we do not have. **Action**: Rename P1-05 subject to "ERP integration: SAP S/4HANA deep dive + NetSuite and Salesforce overviews" and ensure it routes exclusively to pilot-status pages.

### Risk 5 — Post 5 (Turkey) referenced by Pattern C in W5 but post is Low KD / 400 vol
Not a link risk, but a **capacity risk**: W5 sends to 100% of signups on Day 8, which means a 400-vol post will get disproportionate internal traffic vs its SEO ceiling. Good for conversion, wasteful for SEO juice. **Action**: Add 3 more outbound contextual links from Post 5 → Pillar 3 siblings to distribute the internal pagerank. Already specified in `internal-link-graph.md` line 251.

### Risk 6 — Cross-cluster bridges in `internal-link-graph.md` §Cross-Cluster Bridges are underspecified
The Mermaid diagram shows dashed bridges but no reciprocal anchor-text rules. E.g., Post 5 ↔ Post 13 (ERP ↔ Intelligence) needs explicit text snippet. **Action**: Copywriter brief gets this as a required section in each post's outline.

---

## 9. Friday audit filter (Notion view spec for CMM)

Filter: `Blog Pipeline` where:
- `count(Linked Emails) < 3` OR
- `count(Related LinkedIn Posts) < 2` OR
- `count(Internal Inbound Links) < 3`

Sort: `Publish Date` ascending. Any non-empty row = blocker. Assigned to CMM with 24h SLA.

Second filter: all `Published` posts where any referenced email target URL returns 404 (weekly crawl script, post-MVP). Triggers fix-within-24h protocol.
