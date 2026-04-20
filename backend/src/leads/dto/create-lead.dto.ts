import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateLeadDto {
  @IsString()
  @MinLength(2)
  name!: string

  @IsOptional()
  @IsString()
  company?: string

  @IsEmail()
  email!: string

  @IsOptional()
  @IsString()
  phone?: string

  /**
   * Intent signal mapped to pricing/integration dropdown on the form.
   * Suggested values:
   *   "sourcing_starter" | "sourcing_pro" | "full_bundle" | "enterprise_custom"
   *   | "procurement_addon" | "integration_sap" | "integration_oracle" | "integration_dynamics"
   *   | "integration_salesforce" | "integration_other" | "other"
   *   | "lead_magnet:<slug>" | "newsletter"
   */
  @IsString()
  interest!: string

  @IsOptional()
  @IsString()
  message?: string

  /**
   * Where the form lives (e.g. "contact_page", "pricing_page", "integrations_hub",
   * "industry_manufacturing", "feature_ai_sourcing", "resource-gate", "newsletter_footer").
   */
  @IsOptional()
  @IsString()
  source?: string

  @IsOptional()
  @IsString()
  language?: string // "pl" | "en"

  @IsOptional()
  @IsString()
  utmSource?: string

  @IsOptional()
  @IsString()
  utmMedium?: string

  @IsOptional()
  @IsString()
  utmCampaign?: string

  /**
   * When the form is a lead-magnet gate (source="resource-gate"), this
   * carries the resource slug so the backend can send a dedicated email
   * with the download link.
   */
  @IsOptional()
  @IsString()
  resourceSlug?: string
}
