# Salesforce for Procurement: When It Works (And When You Need Something Else)

## Metadata
- **Slug:** salesforce-procurement-integration-when-it-works
- **Pillar:** ERP/CRM Integration
- **Persona:** P1 — Head of Procurement
- **Funnel:** MOFU
- **Primary KW:** salesforce procurement integration
- **Word count target:** 1500
- **Publish wave:** 3

## Target reader profile
A Head of Procurement at a company (200-1000 employees) where Sales uses Salesforce as the system of record, and leadership has asked "can we just use Salesforce for supplier management too?" She needs a clear answer and, if no, a credible alternative with integration.

## Success metric
- 2+ integration call bookings per quarter.
- Ranking top 10 for "salesforce procurement integration" within 120 days (volume 180 — niche but high intent).
- Referral CTR to `/integrations` > 10%.

## Primary CTA
"Book a Salesforce integration call — we'll show how to keep Salesforce as your CRM and add a sourcing layer without duplication." (Cal.com)

## Internal link targets (3 mandatory)
- Feature page: `/integrations` (Salesforce detail page status: Pilot)
- Industry page: `/industries/retail-ecommerce` OR `/industries/manufacturing`
- Related post or lead magnet: `/blog/ai-sourcing-tool-buyers-guide-12-questions`

## Copy angle (1 sentence)
Salesforce's "Account" object can technically hold suppliers, but it breaks at the first RFQ — this post defines the 3 scenarios where Salesforce-for-procurement works (small teams, service suppliers, CRM-led cultures) and the 4 where it doesn't.

## Must-include elements
- When Salesforce CAN work for procurement (with honest caveats): small company (< 50 suppliers/year), mostly service suppliers (consultants, agencies, freelancers), Sales-led culture with one system dogma, no RFQ orchestration needs.
- When it CAN'T: multi-quote RFQ comparison, supplier discovery, certification tracking, multilingual outreach, PO/invoice matching (that's ERP anyway).
- The Account-as-Vendor anti-pattern: what breaks (duplicate records when the same company is both a customer and a vendor, custom object proliferation, flow complexity, licensing costs multiplying).
- Integration model for keeping Salesforce + adding a sourcing tool: Salesforce = account of record for commercial relationships, Procurea = pre-PO sourcing + qualification, data flow = bi-directional sync on Account lookup when supplier becomes a vendor.
- Technical detail: Salesforce REST API + Merge.dev integration (current status: Pilot) OR custom Apex triggers (Enterprise Custom).
- The Account object schema extension for supplier data: what custom fields to add on Salesforce Account, what stays in Procurea.
- FAQ: "salesforce vendor management app options", "salesforce crm for procurement pros and cons", "when to buy a procurement tool vs. extend salesforce".

## Out of scope
- Full Salesforce customization guide (not our lane).
- Comparing Salesforce to Dynamics CRM (different post).
- CPQ (Configure-Price-Quote) for sales-side — different topic.
- Over-claiming: current Procurea Salesforce integration = Pilot only.
