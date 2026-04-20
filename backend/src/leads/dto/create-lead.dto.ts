export class CreateLeadDto {
  name!: string
  company?: string
  email!: string
  phone?: string
  /**
   * Intent signal mapped to pricing/integration dropdown on the form.
   * Suggested values:
   *   "sourcing_starter" | "sourcing_pro" | "full_bundle" | "enterprise_custom"
   *   | "procurement_addon" | "integration_sap" | "integration_oracle" | "integration_dynamics"
   *   | "integration_salesforce" | "integration_other" | "other"
   */
  interest!: string
  message?: string
  /**
   * Where the form lives (e.g. "contact_page", "pricing_page", "integrations_hub",
   * "industry_manufacturing", "feature_ai_sourcing").
   */
  source?: string
  language?: string // "pl" | "en"
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  /**
   * When the form is a lead-magnet gate (source="resource-gate"), this
   * carries the resource slug so the backend can send a dedicated email
   * with the download link.
   */
  resourceSlug?: string
}
