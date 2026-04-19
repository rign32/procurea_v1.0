# Schema.org Strategy — Structured Data per Page Type

> **Purpose**: define which schema.org type each page gets, with JSON-LD templates ready for copy-paste into the React Helmet / pre-render HTML. Structured data drives rich results (FAQ accordions, How-To steps, article cards, breadcrumbs) — a visibility multiplier even before we rank.
>
> **Rules**:
> - One primary type per page, optional nested secondary types.
> - FAQPage schema **only** when an actual FAQ section exists in-body. Never decorative.
> - Every JSON-LD block must validate via Schema Markup Validator (validator.schema.org) before deploy.
> - Required fields per Google guidelines always included (author, datePublished, headline, image for Article; etc.).
> - No misleading markup — don't mark up as HowTo if post isn't actually instructional.
>
> **Implementation**: inject via Helmet / react-helmet-async in React components, baked into pre-rendered HTML. Add JSON-LD test runner in CI (`landing/scripts/validate-schema.mjs` post-MVP).

---

## Global Organization Schema (site-wide, in `index.html` head)

Emitted on every page. Defines the publisher for Article schemas to reference.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://procurea.io/#organization",
  "name": "Procurea",
  "legalName": "Procurea sp. z o.o.",
  "url": "https://procurea.io",
  "logo": {
    "@type": "ImageObject",
    "url": "https://procurea.io/logo-social.png",
    "width": 512,
    "height": 512
  },
  "description": "AI-first B2B procurement platform for multilingual supplier sourcing, RFQ automation, and vendor intelligence.",
  "sameAs": [
    "https://www.linkedin.com/company/procurea",
    "https://twitter.com/procurea"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Sales",
    "email": "hello@procurea.io",
    "availableLanguage": ["English", "Polish", "German"]
  }
}
```

---

## WebSite Schema (site-wide, in `index.html` head)

Enables Sitelinks Search Box in Google SERP.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://procurea.io/#website",
  "url": "https://procurea.io",
  "name": "Procurea",
  "publisher": {"@id": "https://procurea.io/#organization"},
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://procurea.io/blog?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  },
  "inLanguage": "en-US"
}
```

---

## Per Page-Type Strategy

### 1. Blog post (standard)

**Primary type**: `Article` (or `BlogPosting` — both valid; we standardize on `Article` for consistency with news/thought-leadership SERP treatment).

**Required fields**: headline, description, datePublished, dateModified, author, publisher, image, mainEntityOfPage.

**Optional but recommended**: articleSection, keywords, wordCount, articleBody (truncated).

**Template**:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{{h1_title — 110 chars max}}",
  "description": "{{meta_description}}",
  "image": [
    "https://procurea.io/blog/{{slug}}/cover-1x1.webp",
    "https://procurea.io/blog/{{slug}}/cover-4x3.webp",
    "https://procurea.io/blog/{{slug}}/cover-16x9.webp"
  ],
  "datePublished": "{{ISO_8601_with_timezone}}",
  "dateModified": "{{ISO_8601_with_timezone}}",
  "author": {
    "@type": "Person",
    "name": "{{author_name}}",
    "url": "https://procurea.io/about#{{author_slug}}"
  },
  "publisher": {"@id": "https://procurea.io/#organization"},
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://procurea.io/blog/{{slug}}"
  },
  "articleSection": "{{pillar_name}}",
  "keywords": "{{primary_kw}}, {{secondary_kws_csv}}",
  "inLanguage": "en-US"
}
```

**When to nest FAQPage**: always, since every post has a FAQ section (see `h-structure.md`). See FAQPage template below.

---

### 2. How-To posts (procedural content)

**Use for**: posts that teach a step-by-step procedure with clear outcomes.

**Candidates from our 20 posts**:
- Post 1 — How to Find 100+ Verified Suppliers (5-step process)
- Post 4 — VAT VIES verification (step-by-step check)
- Post 14 — China+1 Strategy (6-week playbook)
- Post 18 — Supplier Discovery Process (6-step process)

**Primary type**: `HowTo` — **in addition to** the main `Article` block (Google supports both on one page via `@graph`).

**Template** (nested within `@graph` alongside Article):

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {"@type": "Article", "...": "as above"},
    {
      "@type": "HowTo",
      "@id": "https://procurea.io/blog/{{slug}}#howto",
      "name": "{{how_to_title}}",
      "description": "{{short_description}}",
      "totalTime": "PT1H",
      "estimatedCost": {
        "@type": "MonetaryAmount",
        "currency": "USD",
        "value": "0"
      },
      "supply": [
        {"@type": "HowToSupply", "name": "Sourcing brief"},
        {"@type": "HowToSupply", "name": "AI supplier sourcing tool"}
      ],
      "tool": [
        {"@type": "HowToTool", "name": "Web browser"},
        {"@type": "HowToTool", "name": "Email client"}
      ],
      "step": [
        {
          "@type": "HowToStep",
          "position": 1,
          "name": "Define the brief",
          "text": "Specify category, geography, certifications, MOQ, and target volume.",
          "url": "https://procurea.io/blog/{{slug}}#step-1"
        },
        {
          "@type": "HowToStep",
          "position": 2,
          "name": "Run multilingual search",
          "text": "Search across 5-10 countries in local languages simultaneously.",
          "url": "https://procurea.io/blog/{{slug}}#step-2"
        }
      ]
    }
  ]
}
```

**Anchor rule**: each `HowToStep.url` must point to an in-body `id="step-N"` attribute (React writer adds `<h3 id="step-N">` to the section).

---

### 3. Comparison posts (country / vendor tables)

**Candidates from our 20 posts**:
- Post 3 — European Nearshoring (country comparison)
- Post 5 — SAP Ariba Alternative (vs Ariba / Jaggaer)
- Post 11 — Textile: Turkey vs Poland vs Portugal
- Post 14 — China+1 (Vietnam vs India vs Mexico vs …)
- Post 20 — AI Sourcing Tool Comparison (vs Scoutbee / Tealbook)

**Primary type**: `Article` (keep it — Google rarely honors `Table` standalone). Add `Dataset` or `ItemList` if the comparison is data-heavy.

**`ItemList` template** (for comparison tables):

```json
{
  "@type": "ItemList",
  "@id": "https://procurea.io/blog/{{slug}}#comparison",
  "name": "{{comparison_title, e.g., 'Turkey vs Poland vs Portugal textile sourcing'}}",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Turkey",
      "description": "Strongest in knitwear, denim, home textile. MOQ: 500-1,000 units. Lead time: 4-6 weeks."
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Poland",
      "description": "Strongest in workwear, lingerie. MOQ: 200-500 units. Lead time: 3-5 weeks."
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Portugal",
      "description": "Strongest in premium knitwear, shoes. MOQ: 300-1,000 units. Lead time: 2-4 weeks."
    }
  ]
}
```

**Notes**:
- Don't use `Table` microdata — Google does not render table rich results.
- `ItemList` pairs well with in-body HTML `<table>` markup (accessibility) for rendering.
- Consider `SoftwareApplication` schema for Post 5 (SAP Ariba) and Post 20 (vendor comparison) — rich tech-SERP treatment.

---

### 4. FAQPage (nested within every post)

Every post has an FAQ section (see `h-structure.md`). Emit FAQPage schema **only** when section exists and contains 3+ real Q&As.

**Primary type** in that nested block: `FAQPage` with `mainEntity` array of `Question` + `Answer`.

**Template**:

```json
{
  "@type": "FAQPage",
  "@id": "https://procurea.io/blog/{{slug}}#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does AI find suppliers differently from Google?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AI supplier sourcing runs multilingual search across trade registries and directories, then scores candidates on relevance, verification, and capabilities. It replaces hours of manual filtering with a ranked shortlist."
      }
    },
    {
      "@type": "Question",
      "name": "Is AI sourcing reliable enough for production orders?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AI sourcing produces a verified longlist, not a final selection. Every shortlisted supplier still goes through human qualification, samples, and (for critical parts) on-site audits before a production PO."
      }
    }
  ]
}
```

**Validation**:
- Question.name must be an actual question (ends with `?`).
- Answer.text must be non-trivial (Google flags stub answers).
- Max 10 Q&As per page (we use 3-5 per h-structure spec).

---

### 5. Case studies

**Location**: `/case-studies/:slug` (per IA, empty-friendly for MVP).

**Primary type**: `Article` with `@type: ["Article", "CaseStudy"]` multi-type (CaseStudy is a valid schema.org extension via `additionalType`).

**Recommended schema**: `Article` + explicit `about` (CreativeWork) + numeric results via `mentions`.

**Template**:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "additionalType": "https://schema.org/CaseStudy",
  "headline": "{{case_study_title}}",
  "description": "{{result_summary}}",
  "datePublished": "{{iso}}",
  "author": {"@type": "Organization", "@id": "https://procurea.io/#organization"},
  "publisher": {"@id": "https://procurea.io/#organization"},
  "image": "{{hero_image_url}}",
  "about": {
    "@type": "Thing",
    "name": "{{industry_or_use_case}}"
  },
  "mentions": [
    {
      "@type": "QuantitativeValue",
      "name": "sourcing time reduction",
      "value": 85,
      "unitCode": "P1"
    },
    {
      "@type": "QuantitativeValue",
      "name": "alternative suppliers identified",
      "value": 18,
      "unitCode": "C62"
    }
  ]
}
```

Skip for MVP — re-enable when first case studies ship.

---

### 6. Lead magnet landing pages

**Location**: `/resources/:slug` (e.g., `/resources/rfq-comparison-template`).

**Primary type**: `WebPage` with `mainEntity` describing the resource.

**Downloadable file**: mark as `DigitalDocument` if PDF/DOCX.

**Template**:

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "{{magnet_title}}",
  "description": "{{magnet_description}}",
  "url": "https://procurea.io/resources/{{slug}}",
  "isPartOf": {"@id": "https://procurea.io/#website"},
  "publisher": {"@id": "https://procurea.io/#organization"},
  "mainEntity": {
    "@type": "DigitalDocument",
    "name": "{{file_name}}",
    "encodingFormat": "application/pdf",
    "description": "{{file_description}}",
    "fileFormat": "PDF",
    "numberOfPages": "{{N}}",
    "inLanguage": "en-US",
    "accessMode": "visual",
    "isAccessibleForFree": false,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "description": "Free download in exchange for business email"
    }
  }
}
```

**Note**: `isAccessibleForFree: false` is technically accurate (requires email) — be honest with Google.

---

### 7. Content hub / Blog index

**Location**: `/blog` (and pillar hub pages once created).

**Primary type**: `CollectionPage` with `mainEntity: ItemList` of posts.

**Template**:

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Procurea Blog — AI Procurement & Sourcing Insights",
  "description": "Practical guides for procurement managers on AI sourcing, ERP integration, supplier risk, and nearshoring.",
  "url": "https://procurea.io/blog",
  "isPartOf": {"@id": "https://procurea.io/#website"},
  "publisher": {"@id": "https://procurea.io/#organization"},
  "mainEntity": {
    "@type": "ItemList",
    "numberOfItems": 20,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "url": "https://procurea.io/blog/how-to-find-100-verified-suppliers",
        "name": "How to Find 100+ Verified Suppliers in Under an Hour"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "url": "https://procurea.io/blog/rfq-automation-excel-wont-cut-it",
        "name": "RFQ Automation: What It Is, Why Excel Won't Cut It"
      }
    ]
  }
}
```

---

### 8. Breadcrumbs (every blog post & deeper page)

**Primary type**: `BreadcrumbList` (separate `@graph` entry).

**Template**:

```json
{
  "@type": "BreadcrumbList",
  "@id": "https://procurea.io/blog/{{slug}}#breadcrumb",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://procurea.io"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://procurea.io/blog"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "{{post_title_or_category}}",
      "item": "https://procurea.io/blog/{{slug}}"
    }
  ]
}
```

---

### 9. Feature / Product pages

**Location**: `/features/*`, `/pricing`.

**Primary type**: `SoftwareApplication` (for features) + `Product` (for pricing).

**Template — `SoftwareApplication`**:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Procurea AI Supplier Sourcing",
  "applicationCategory": "BusinessApplication",
  "applicationSubCategory": "Procurement Software",
  "operatingSystem": "Web, iOS, Android",
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "199",
    "highPrice": "1499",
    "priceCurrency": "USD",
    "offerCount": "4"
  },
  "description": "AI-assisted supplier discovery that finds 100+ verified manufacturers in under an hour, across 10 languages.",
  "url": "https://procurea.io/features/ai-sourcing",
  "image": "https://procurea.io/features/ai-sourcing/hero.png",
  "publisher": {"@id": "https://procurea.io/#organization"}
}
```

Leave `aggregateRating` / `review` off until we have verified customer reviews (no fake ratings — Google penalizes heavily).

---

## Per-Post Schema Assignment Table

| Post | Primary schema | Nested/Additional | Notes |
|---|---|---|---|
| 1. How to Find 100+ Suppliers | Article | HowTo + FAQPage + Breadcrumb | 5-step process |
| 2. RFQ Automation | Article | FAQPage + Breadcrumb | No clear HowTo steps |
| 3. European Nearshoring | Article | ItemList (countries) + FAQPage + Breadcrumb | Comparison list |
| 4. VAT VIES Verification | Article | HowTo (verification steps) + FAQPage + Breadcrumb | 4-step check |
| 5. SAP Ariba Alternative | Article | ItemList (vendor comparison) + FAQPage + Breadcrumb | Comparison |
| 6. AI Procurement Software | Article | ItemList (7 features) + FAQPage + Breadcrumb | Feature listicle |
| 7. German Manufacturer Sourcing | Article | FAQPage + Breadcrumb | |
| 8. RFQ Comparison Template | Article | HowTo (how to use) + FAQPage + Breadcrumb | Lead magnet page also gets WebPage |
| 9. Supplier Risk Management | Article | ItemList (4 risk types) + FAQPage + Breadcrumb | |
| 10. 30-Hour Problem | Article | FAQPage + Breadcrumb | |
| 11. Turkey vs Poland vs Portugal | Article | ItemList (countries) + FAQPage + Breadcrumb | Comparison |
| 12. ISO 9001 vs IATF 16949 vs FDA | Article | ItemList (certifications) + FAQPage + Breadcrumb | Comparison |
| 13. Supplier Master Data Quality | Article | HowTo (audit steps) + FAQPage + Breadcrumb | Audit script |
| 14. China+1 Strategy | Article | HowTo (6-week playbook) + ItemList (countries) + FAQPage + Breadcrumb | Rich markup |
| 15. Vendor Scoring Framework | Article | ItemList (10 criteria) + FAQPage + Breadcrumb | |
| 16. NetSuite Supplier Management | Article | FAQPage + Breadcrumb | |
| 17. TCO in Procurement | Article | HowTo (TCO calculation) + FAQPage + Breadcrumb | Formula + calculator |
| 18. Supplier Discovery Process | Article | HowTo (6 steps) + FAQPage + Breadcrumb | Process walkthrough |
| 19. Salesforce for Procurement | Article | FAQPage + Breadcrumb | |
| 20. AI Sourcing Tool Buyer's Guide | Article | ItemList (12 questions) + FAQPage + Breadcrumb | Questions listicle |

---

## Hreflang (not schema, but critical meta)

Every post emits hreflang for EN (procurea.io) + PL (procurea.pl) when PL translation exists.

```html
<link rel="alternate" hreflang="en-us" href="https://procurea.io/blog/{{slug}}" />
<link rel="alternate" hreflang="pl-pl" href="https://procurea.pl/blog/{{slug-pl}}" />
<link rel="alternate" hreflang="x-default" href="https://procurea.io/blog/{{slug}}" />
```

For MVP content hub (EN-only initially), emit only `en-us` + `x-default` pointing to same URL. Add PL variants as translations ship.

---

## Implementation Checklist

Before any post goes live:

1. [ ] JSON-LD block(s) injected via React Helmet or pre-render
2. [ ] Article schema: required fields populated (headline, description, image×3, datePublished, dateModified, author, publisher, mainEntityOfPage)
3. [ ] FAQPage schema: matches actual FAQ section Q&As exactly
4. [ ] HowTo schema: step anchors match `<h3 id="step-N">` in body (if applicable)
5. [ ] Breadcrumb schema: URLs match real navigation path
6. [ ] Validated via validator.schema.org (no errors, warnings acceptable if intentional)
7. [ ] Hreflang tags present
8. [ ] Canonical tag: `<link rel="canonical" href="https://procurea.io/blog/{{slug}}" />` (self-referencing unless intentionally pointing elsewhere)
9. [ ] Open Graph + Twitter Card meta (see `meta-templates.md`)
10. [ ] Rich Results Test (search.google.com/test/rich-results) passes

---

## CI Validation (post-MVP)

Add `landing/scripts/validate-schema.mjs` to build step:

```js
// Pseudocode
for each *.mdx in landing/src/content/blog/:
  const rendered = prerender(post);
  const jsonLd = extractJsonLdFromHtml(rendered);
  for each block:
    validateAgainstSchemaOrg(block);
    if block.@type === 'FAQPage':
      assert post.frontmatter.faq.length === block.mainEntity.length;
    if block.@type === 'HowTo':
      assert block.step.every(s => htmlContainsAnchor(rendered, s.url));
fail CI if any invalid.
```

Blocks a merge if any post ships invalid structured data.

---

## Deliberate Omissions

We **do not** use:

- **AggregateRating / Review** — no verified customer reviews yet. Google penalizes fake ratings. Re-evaluate post-MVP when we have G2/Capterra listings.
- **Event schema** — no live events yet.
- **VideoObject** — reserve for when YouTube walkthroughs are published (Post 8 — template walkthrough is the first candidate).
- **NewsArticle** — we are thought leadership, not journalism. `Article` is the correct bucket.
- **Table microdata** — Google doesn't render Table rich results; use HTML `<table>` + `ItemList` schema instead.
- **Speakable** — primarily for news voice assistants; not relevant for our content.
