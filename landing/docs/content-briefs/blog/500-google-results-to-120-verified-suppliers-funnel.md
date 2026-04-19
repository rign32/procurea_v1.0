# From 500 Google Results to 120 Verified Suppliers: The Sourcing Funnel Explained

## Metadata
- **Slug:** 500-google-results-to-120-verified-suppliers-funnel
- **Pillar:** AI Sourcing Automation
- **Persona:** P2 — Purchasing Manager
- **Funnel:** TOFU
- **Primary KW:** supplier discovery process
- **Word count target:** 1700
- **Publish wave:** 3

## Target reader profile
A Purchasing Manager curious about how AI sourcing actually works behind the scenes before she signs up for a trial. She has read Procurea's landing page and wants to verify the claims ("120 verified suppliers in an hour") by seeing the pipeline logic explained — not a sales pitch.

## Success metric
- 15+ trial signups attributed to this post in 60 days (bottom-of-TOFU quality traffic).
- Dwell time > 4 minutes (technical audience reads carefully).
- Ranking top 15 for "supplier discovery process" within 120 days.

## Primary CTA
"See the funnel live — run a free search, watch 500 raw results filter down to ~100 verified leads in real time."

## Internal link targets (3 mandatory)
- Feature page: `/features/ai-sourcing`
- Industry page: `/industries/manufacturing`
- Related post or lead magnet: `/blog/how-to-find-100-verified-suppliers-in-under-an-hour`

## Copy angle (1 sentence)
This post lifts the hood on the 4-stage supplier discovery pipeline (Strategy → Screener → Enrichment → Auditor) and shows the math at each stage — how 500 web results become 120 verified suppliers with realistic precision/recall trade-offs.

## Must-include elements
- Visual funnel diagram: 500 raw URLs → 280 relevant companies after Screener → 180 enriched with emails → 120 verified with current certifications. Show drop-off at each stage.
- Stage-by-stage explanation:
  - **Strategy**: how 1 user query becomes 30+ refined search queries across 3-4 countries and 2-3 languages (we do not show the prompt engineering).
  - **Screener**: LLM-based relevance scoring (is this actually a supplier or a directory/news article/consultant?). Precision 85-92%, recall ~70% (we miss some; we flag this honestly).
  - **Enrichment**: email discovery (public website + pattern matching + VIES company registry lookup). Email hit rate ~85%.
  - **Auditor**: final sanity check — does the website load, is the company still trading, do claimed certifications verify in public registries.
- Where the process can fail (honest): non-English local-language directories we don't scrape, very niche niches (<10 suppliers globally), shell companies that pass automated checks.
- Time comparison: manual (30h for ~20 suppliers, ~40% email coverage) vs. assisted (1h for 120 suppliers, ~85% email coverage).
- Why this matters for the buyer: reproducibility (run the same search 3 months later, get an updated list), audit trail (show Internal Audit every URL and decision), language coverage (DE/FR/ES/IT searches that would require hired translators otherwise).

## Out of scope
- Prompt engineering or model details (IP).
- Product roadmap claims (keep it to shipped capabilities).
- Side-by-side with competitors (Post #5 handles that).
