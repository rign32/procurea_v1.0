# Procurea Content Hub — 8-Agent Feedback Loop Protocol

> **Owner**: Senior Marketing Manager
> **Purpose**: Define who reviews what, when, and how agents pass work without creating bottlenecks or silent failures.
> **Principle**: Reviews are concrete (a checklist), not opinions. If a reviewer cannot point to a rule that the work violates, the work ships.

---

## 1. The 8 agents and their outputs

| # | Agent | Owns | Primary output | Downstream consumers |
|---|---|---|---|---|
| 1 | **Product Owner (PO)** | Content briefs, persona alignment, Notion source of truth | Brief doc (Notion page per blog post) | SEO, Copywriter, UX |
| 2 | **SEO Specialist** | Keyword research, H1/H2/H3 structure, internal link map, meta tags | SEO outline per post (attached to brief) | Copywriter |
| 3 | **Copywriter (EN-first)** | Draft content in English + PL translation | Markdown draft in `landing/src/content/blog.ts` (or MDX) | SEO (for review), Content Marketing Manager, UX |
| 4 | **UX Designer** | Layout, hero image spec, OG image spec, inline infographic briefs | Figma frames + hero/OG specs | Graphic Designer, Full-Stack Dev |
| 5 | **Graphic Designer** | Asset production (PNG hero, PNG OG, SVG/PNG inline charts) | Finished assets in `landing/public/img/blog/` | Full-Stack Dev |
| 6 | **Content Marketing Manager (CMM)** | Cross-linking enforcement (3 emails + 2 LI per post), Notion relations, weekly audits | Filled Notion relations + weekly audit report | Senior Marketing Manager |
| 7 | **Full-Stack Dev** | Deploy to staging, sitemap, structured data, form wiring | Live staging URL + passing CI | Senior Marketing Manager (for final review) |
| 8 | **Senior Marketing Manager (SMM, this role)** | Strategy enforcement, final anti-pattern check, production deploy sign-off | Go/no-go decision per post | PO (if escalation needed) |

---

## 2. The end-to-end flow per blog post

```
┌─ PO: write brief ─┐
│                    │
├──→ SEO: keyword map + H1/H2/H3 outline
│                    │
├──→ Copywriter: draft EN → SEO review → Copywriter final → PL translation
│                    │
├──→ UX: layout + hero/OG specs ──→ Graphic Designer: assets
│                    │
├──→ CMM: wire 3 emails + 2 LI in Notion
│                    │
├──→ Full-Stack Dev: deploy to staging
│                    │
└──→ SMM: final review → production deploy
```

**Sequencing rule**: PO brief → SEO outline → Copywriter draft are **strictly sequential**. Everything downstream (UX/Graphic, CMM cross-linking, Dev deploy) runs in **parallel** once the draft is in SEO review.

---

## 3. Handoffs in detail

### 3.1 PO → SEO + Copywriter + UX (brief handoff)

**PO responsibility**: write the Notion page for each blog post with these fields populated:

- `Title`, `Slug`, `Target Keyword`, `Est. Search Volume`, `Pillar`, `Persona`, `Funnel`, `Publish Date`, `Primary CTA`, `Outline`, `Word Count Target`
- Linked resources: which lead magnet, which feature page, which case study, which industry page
- Persona JTBD reference: a paragraph explaining *why this post exists for this persona right now*
- Business rationale: what search intent / what funnel stage / what competitor gap

**Definition of Done for PO**: brief is complete + Senior Marketing Manager acknowledged in a thread comment.

**Handoff signal**: PO changes Notion status from `Idea` → `Drafting`. Auto-notifies SEO + Copywriter + UX via Notion mention.

---

### 3.2 SEO → Copywriter (keyword map + outline)

**SEO Specialist responsibility**:

- Confirm primary keyword + 2–5 secondary keywords from `keyword-map.md` (or propose additions if gap found)
- Produce H1/H2/H3 outline attached to the brief (not a separate doc — as a block inside the Notion brief)
- Define internal link map: 3–5 internal URLs this post should link to (other blog posts, feature pages, industry pages, lead magnets, use cases)
- Define external link map: 1–3 authoritative external citations (industry reports, regulator pages, peer-reviewed data). **If the post cannot cite 1 external authority, flag to PO** — may indicate thin topic.
- Define meta title (≤60 chars) + meta description (≤155 chars) drafts
- Define Schema.org markup type (Article / FAQ / HowTo)

**Definition of Done for SEO (pre-draft)**:
- [ ] Primary + secondary KWs confirmed in Notion
- [ ] H1/H2/H3 outline in brief
- [ ] Internal link map ≥3 links
- [ ] External link map ≥1 authority
- [ ] Meta tags drafted
- [ ] Schema type chosen

**Handoff signal**: SEO tags Copywriter in Notion comment: "SEO outline ready, draft go."

---

### 3.3 Copywriter → SEO + CMM (draft handoff)

**Copywriter responsibility**:

- Write EN draft following the SEO outline (H1/H2/H3 exact or near-exact)
- Apply brand voice principles from `strategy.md` section 4 (specificity, numbers, operator voice)
- Ensure every 250-word block has a subhead
- Insert inline CTA block at ~50% of post length (usually before the final 1–2 H2s)
- Insert Primary CTA at end (from Notion `Primary CTA` field verbatim)
- Respect word count target from brief (±10%)
- Draft PL translation **in parallel** after EN is locked — does not hold up English ship

**Definition of Done for Copywriter**:
- [ ] EN draft in `landing/src/content/blog.ts` (or MDX file if that's the chosen pipeline) with `isEN` ternary pattern matching existing posts
- [ ] Word count within ±10% of brief target
- [ ] All H1/H2/H3 from SEO outline present
- [ ] Internal links inserted (from SEO link map)
- [ ] External citations with link text + URL
- [ ] Primary CTA + inline CTA present
- [ ] Anti-pattern word list check passed (see `strategy.md` §4.2)

**Handoff signal**: Copywriter commits to feature branch, opens PR, tags SEO (for keyword density/internal link review) + CMM (for cross-linking setup).

---

### 3.4 SEO review of Copywriter draft

**SEO Specialist post-draft responsibility**:

- Keyword density check: primary KW appears in H1, first paragraph, at least 2 H2s, final paragraph (natural; no stuffing)
- Internal link count ≥3 with contextual anchor text (not "click here")
- Meta title + description now match the drafted content (tune if needed)
- Alt text for all images references primary or secondary KW naturally
- Schema markup draft generated (JSON-LD snippet)

**Definition of Done for SEO (post-draft)**:
- [ ] Keyword density review passed
- [ ] Internal/external links verified
- [ ] Meta tags finalized
- [ ] Alt text reviewed
- [ ] Schema JSON-LD ready for Dev

**Feedback mechanism**: SEO leaves inline comments on the PR or Notion draft. Copywriter has 24h to address. If more than 5 structural changes requested, SEO and Copywriter do a 15-min sync instead of comment ping-pong.

---

### 3.5 CMM → Notion relations (cross-linking)

**Content Marketing Manager responsibility** (runs in parallel with SEO review):

- Open Notion `📚 Blog Pipeline` → the post's row
- Populate `Linked Emails` relation with ≥3 emails from `✉️ Email Sequences` (use the map in `newsletter-integration.md`)
- Populate `Related LinkedIn Posts` relation with ≥2 LI posts from `🎤 LinkedIn Pipeline`
- For each linked email: open that email row, confirm the blog is referenced in the email body (Pattern A/B/C from `newsletter-integration.md`)
- For each linked LI post: confirm the post is tied to the email chain correctly

**Definition of Done for CMM**:
- [ ] ≥3 emails linked in Notion
- [ ] ≥2 LinkedIn posts linked in Notion
- [ ] All referenced emails have blog link in body (spot-check at least 1 per post)
- [ ] Friday audit view passes (no missing relations)

**Handoff signal**: CMM adds Notion comment "Cross-linking complete" tagging SMM.

---

### 3.6 UX Designer → Graphic Designer (spec handoff)

**UX Designer responsibility** (runs parallel to SEO/draft phase):

- Define hero image concept (Figma frame) — must visually match post topic, not generic stock
- Define OG image template (Procurea logo, post title, pillar badge, hero color)
- Define inline graphics (infographics, diagrams, charts) — 1–3 per post depending on density
- Define responsive layout specs if post has non-standard elements (comparison tables, scorecard embeds)

**Definition of Done for UX**:
- [ ] Hero concept in Figma
- [ ] OG template applied with post-specific copy
- [ ] Inline graphic briefs (if any)
- [ ] Mobile/tablet layout notes

**Handoff signal**: UX adds Figma link to Notion brief, tags Graphic Designer.

---

### 3.7 Graphic Designer → Full-Stack Dev (assets)

**Graphic Designer responsibility**:

- Produce final PNG hero (≥1600×900, ≤300KB compressed)
- Produce final PNG OG image (1200×630, ≤200KB)
- Produce inline graphics (SVG preferred for charts; PNG for photographic assets)
- Name files per convention: `blog-{slug}-hero.png`, `blog-{slug}-og.png`, `blog-{slug}-fig-01.svg`

**Definition of Done for Graphic Designer**:
- [ ] Files committed to `landing/public/img/blog/` on feature branch
- [ ] OG image preview in Notion brief
- [ ] File sizes optimized

**Handoff signal**: Graphic Designer pushes to branch, tags Full-Stack Dev.

---

### 3.8 Full-Stack Dev → SMM (deploy to staging)

**Full-Stack Dev responsibility**:

- Merge draft + assets to `staging` branch
- Ensure:
  - Post renders at correct URL (procurea.io/blog/{slug} and procurea.pl/blog/{slug})
  - Meta tags present and unique per post
  - OG image loads on link preview (test LinkedIn/Twitter preview tool)
  - Schema.org JSON-LD injected
  - Internal links work
  - Newsletter form on post page wires to correct list (P1/P2M/P2S based on persona)
  - Sitemap.xml regenerated with new URL
  - `hreflang` tags for EN ↔ PL pair
- Open staging preview URL in Slack: `procurea-app-staging.web.app/blog/{slug}`

**Definition of Done for Dev**:
- [ ] Renders correctly on procurea-app-staging.web.app
- [ ] Lighthouse score: Performance ≥85, SEO ≥95, Accessibility ≥90
- [ ] CI green on branch
- [ ] hreflang works

**Handoff signal**: Dev pings SMM with staging URL.

---

### 3.9 SMM → Production deploy (final review)

**Senior Marketing Manager responsibility**:

- Open staging URL
- Run final checklist (below)
- Either approve (merge staging → main) or request changes (open specific issues, not vague feedback)

**SMM final checklist (Definition of Done for entire post)**:

- [ ] Post matches strategy.md anti-patterns (§4.2) — no banned words, has numbers, has concrete examples
- [ ] Primary keyword = H1 (or natural variant)
- [ ] Primary CTA present and matches Notion `Primary CTA` field
- [ ] Hero image renders correctly + OG preview looks right on LinkedIn
- [ ] ≥3 emails linked in Notion `Linked Emails`
- [ ] ≥2 LinkedIn posts linked in Notion `Related LinkedIn Posts`
- [ ] Internal links present (≥3) with contextual anchor text
- [ ] Post schedules on correct `Publish Date` from Notion
- [ ] PL version reviewed (or PL-skip documented with reason)
- [ ] Related posts footer shows 3 related posts
- [ ] Lighthouse SEO ≥95
- [ ] CMM audit view is clean (no broken relations)
- [ ] No ERP over-claims if post touches integrations (see strategy.md §5.5)

If any checkbox fails: SMM leaves specific issue tied to owning agent. Post does not ship until all green.

**Approval signal**: SMM merges staging → main. CI/CD handles production deploy. SMM posts in Slack: "`{slug}` live on procurea.io — here is the OG preview + URL."

---

## 4. Feedback loops (not just one-way handoffs)

### 4.1 Copywriter ↔ SEO loop

Iteration cycle for draft review:
- SEO leaves ≤5 inline comments → Copywriter addresses in 24h → SEO re-reviews → merge
- >5 structural comments → 15-min sync, do not ping-pong in comments

### 4.2 CMM ↔ SMM loop

CMM surfaces cross-linking risks proactively:
- If a post will go live but only has 2 emails linked (not 3) because the 3rd email is still in `Drafting` → CMM flags to SMM, SMM either delays blog post or accepts the gap with a plan to backfill within 7 days

### 4.3 Dev ↔ SMM loop

If staging has render issues:
- Dev fixes in 24h (most issues are font loading, alt text, OG image path)
- If fix requires brief/copy change → escalate to PO, not just Dev
- If fix requires design change → escalate to UX + Graphic

### 4.4 SMM ↔ PO escalation

SMM escalates to PO when:
- A post violates strategy (wrong persona, wrong funnel, weak keyword) → reject before publishing, ask PO to rebrief
- Content Factory math breaks (ratio drift: blog posts accumulating without email/LI backing)
- Pillar distribution drifts ±10% vs target
- A Wave is >1 week behind schedule

PO can escalate up to the CEO / founder if:
- SMM is blocking on strategy grounds but deadlines are slipping
- A critical product claim (e.g., ERP status) is unclear

---

## 5. Weekly sync cadence

### Monday 10:00 — Weekly planning (30 min)

- **Attendees**: PO, SMM, CMM, Copywriter, SEO
- **Agenda**:
  1. Review this week's blog post (what's in `Drafting`, `Scheduled`)
  2. Review this week's LinkedIn calendar (4 posts)
  3. Review any slipped items from last week
  4. Blockers triage

### Wednesday 14:00 — Design sync (15 min)

- **Attendees**: UX Designer, Graphic Designer, Full-Stack Dev
- **Agenda**:
  1. Review hero/OG specs for this week's post
  2. Review asset production status
  3. Staging deploy status

### Friday 15:00 — Content Factory audit (20 min)

- **Attendees**: CMM, SMM
- **Agenda**:
  1. Run Notion Friday audit view (posts with <3 emails or <2 LI links)
  2. Run "post due in ≤7 days + not published" view
  3. Review LinkedIn analytics from past week — top performer, underperformer
  4. Update Wave status in `editorial-calendar.md`

### Monthly (first Monday) — Pillar + persona distribution review (45 min)

- **Attendees**: SMM, PO, CMM, SEO
- **Agenda**:
  1. Review pillar distribution actual vs target (from `editorial-calendar.md` §5)
  2. Review persona distribution actual vs target
  3. Review keyword performance in GSC (after 30 days of live posts)
  4. Propose adjustments to Wave 2/3 ordering based on data

---

## 6. Definition of Done — compiled checklist per content piece

This is the master checklist. A blog post is "done" when **all** of these are true:

### Strategy & planning
- [ ] Notion brief complete (PO)
- [ ] Primary + secondary keywords from `keyword-map.md` (SEO)
- [ ] Persona + pillar + funnel + publish date set (PO)

### Content
- [ ] EN draft written, SEO-reviewed, anti-pattern-compliant (Copywriter, SEO, SMM)
- [ ] PL translation drafted + reviewed (Copywriter)
- [ ] Word count within ±10% of target
- [ ] H1 = primary KW, 3+ H2s with secondary KWs
- [ ] Internal links ≥3 with contextual anchor text
- [ ] External citation ≥1 authority
- [ ] Primary CTA + inline CTA present

### Design
- [ ] Hero image (≥1600×900, <300KB)
- [ ] OG image (1200×630, <200KB)
- [ ] Inline graphics rendered (if specified in UX brief)
- [ ] Alt text on all images

### Cross-linking (CMM)
- [ ] ≥3 emails link to this post in Notion `Linked Emails`
- [ ] Each linked email has the blog reference in body (Pattern A/B/C)
- [ ] ≥2 LinkedIn posts link to this post via Notion
- [ ] Related Posts footer shows 3 related

### Technical (Dev)
- [ ] Renders on procurea.io/blog/{slug} (EN) + procurea.pl/blog/{slug} (PL)
- [ ] Meta title + description unique
- [ ] OG image loads on social preview tools
- [ ] Schema.org JSON-LD present
- [ ] hreflang EN ↔ PL
- [ ] Sitemap regenerated
- [ ] Newsletter form wired to correct nurture list (P1/P2M/P2S)
- [ ] Lighthouse SEO ≥95, Perf ≥85, A11y ≥90
- [ ] CI green

### Preview + approval (SMM)
- [ ] Staging preview reviewed by SMM
- [ ] Friday audit view clean
- [ ] SMM approval in Slack thread
- [ ] Merge staging → main → production deploy

**If all boxes checked**: post is live, CMM archives brief in Notion with `Status = Published`.

---

## 7. What happens when things go wrong

### Scenario: Copywriter missed draft deadline (48h late)

1. CMM notices in Friday audit view (`Status: Drafting`, `Publish Date` < today + 7d)
2. CMM pings SMM + Copywriter in Slack
3. Copywriter gives ETA in thread (within 2h of ping)
4. If ETA > 3 days: SMM escalates to PO, potentially swaps post with Wave 2 item
5. Downstream emails get shifted (see `newsletter-integration.md` §5 slippage protocol)

### Scenario: SEO disagrees with Copywriter on keyword focus after draft

1. SEO flags in review: "primary KW is `vendor scoring framework` but draft leans toward `supplier evaluation criteria`"
2. SEO and Copywriter sync 15 min to align
3. If no agreement: escalate to SMM — SMM decides based on `keyword-map.md` priority
4. Resolution documented in brief so future posts do not repeat debate

### Scenario: Dev deploys to staging but hero image is broken

1. SMM catches in final review
2. SMM opens specific issue tagged to Graphic Designer + Dev
3. Fix in 24h → re-deploy to staging → SMM re-reviews
4. If still broken: SMM defers publish by 1 day rather than ship broken

### Scenario: Post goes live but LinkedIn amplification did not happen

1. Friday audit catches it (post `Status: Published` but `Related LinkedIn Posts` count = 0)
2. CMM backfills within 24h — writes 2 catch-up LI posts
3. Root cause logged: which agent in the chain missed it?
4. Process fix: add LI count check to Dev's pre-deploy checklist OR to SMM's final review

### Scenario: Product Owner wants to publish a post not in the strategic calendar

1. PO submits request to SMM with rationale
2. SMM evaluates: does it fit pillar distribution? Does it cannibalize an existing planned post's keyword? Does it serve an active persona nurture?
3. SMM approves/rejects within 48h
4. If approved: goes into Wave N (never disrupts current Wave mid-flight unless reactive/news-driven)
5. If rejected: reason documented ("post duplicates `ai-procurement-software-7-features` keyword intent — fold ideas into existing brief instead")

---

## 8. Quarterly retrospective

Every 3 months (Jul 2026, Oct 2026, Jan 2027):

- **Metric review**: actual vs `strategy.md` §7 North Star targets
- **Content performance**: top-5 / bottom-5 posts by organic traffic, newsletter CTR, LinkedIn impressions
- **Agent load review**: which agent is the bottleneck? (typical suspect: Copywriter; fix: expand with 2nd Copywriter or AI-draft pipeline)
- **Process iteration**: what went wrong, what to change, what to keep

Retrospective output is a 1-page memo appended to `roadmap-next-stages.md` — not a separate document.

---

## 9. One-line summary (laminate this)

> Brief → SEO outline → Draft → SEO review → CMM wiring + UX assets + Dev deploy (parallel) → SMM final → Ship. Friday audit catches misses. No post ships without ≥3 emails + ≥2 LinkedIn linked.
