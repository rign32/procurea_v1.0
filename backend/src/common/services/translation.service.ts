import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { ErrorTrackingService } from './error-tracking.service';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// English translations - source of truth for all translations
const ENGLISH_TRANSLATIONS = {
  steps: {
    rfqReview: 'RFQ Details',
    pricing: 'Pricing',
    alternative: 'Alternative',
    confirm: 'Confirmation',
    success: 'Done',
  },
  rfq: {
    title: 'Request for Quotation Details',
    product: 'Product',
    quantity: 'Quantity',
    material: 'Material',
    eau: 'Estimated Annual Usage (EAU)',
    category: 'Category',
    partNumber: 'Part Number',
    description: 'Description',
    incoterms: 'Incoterms',
    deliveryDate: 'Desired Delivery Date',
    deliveryLocation: 'Delivery Location',
    currency: 'Currency',
    unit: 'Unit',
    attachments: 'Attachments',
    downloadAttachment: 'Download',
  },
  pricing: {
    title: 'Your Price Offer',
    subtitle: 'Provide pricing based on order quantity',
    addTier: 'Add tier',
    removeTier: 'Remove',
    from: 'From',
    to: 'To',
    andAbove: 'and above',
    unitPrice: 'Unit price',
    currency: 'Currency',
    moq: 'Minimum Order Quantity (MOQ)',
    moqPlaceholder: 'e.g. 100',
    leadTime: 'Lead Time',
    leadTimePlaceholder: 'e.g. 4',
    leadTimeUnit: 'weeks',
    validityDate: 'Offer valid until',
  },
  alternative: {
    title: 'Alternative Offer',
    subtitle: 'Optionally propose an alternative solution',
    toggle: 'I want to propose an alternative',
    description: 'Alternative Description',
    descriptionPlaceholder: 'E.g. "We propose aluminium 7075 instead of 6061, which provides better durability..."',
    material: 'Alternative Material',
    materialPlaceholder: 'e.g. aluminium 7075',
  },
  confirm: {
    title: 'Confirmation & Submit',
    subtitle: 'Review your offer before submitting',
    specsConfirmed: 'I confirm compliance with the technical specification',
    incotermsConfirmed: 'I accept the Incoterms conditions',
    comments: 'Additional Notes',
    commentsPlaceholder: 'Special conditions, notes about the offer...',
    summary: 'Offer Summary',
    mainOffer: 'Main Offer',
    alternativeOffer: 'Alternative Offer',
    submit: 'Submit Offer',
    submitting: 'Submitting...',
  },
  success: {
    title: 'Thank you for your offer!',
    message: 'Your offer has been submitted. We will contact you regarding the next steps.',
    offerSummary: 'Submitted offer summary',
  },
  common: {
    next: 'Next',
    back: 'Back',
    required: 'Required',
    optional: 'Optional',
    step: 'Step',
    of: 'of',
    poweredBy: 'Powered by Procurea',
  },
  errors: {
    priceRequired: 'Price is required',
    minQtyRequired: 'Minimum quantity is required',
    invalidPrice: 'Price must be greater than 0',
    tierOverlap: 'Quantity ranges must not overlap',
    altDescriptionRequired: 'Alternative description is required',
    altTiersRequired: 'Alternative must have at least one price tier',
    submitFailed: 'Failed to submit offer. Please try again.',
    notFound: 'Offer not found',
    notFoundMessage: 'The link is invalid or has expired.',
    alreadySubmitted: 'Offer already submitted',
    alreadySubmittedMessage: 'This offer has already been submitted and cannot be edited.',
  },
  status: {
    pending: 'Pending',
    viewed: 'Viewed',
    submitted: 'Submitted',
    accepted: 'Accepted',
    rejected: 'Rejected',
  },
};

interface EmailTemplateData {
  productName: string;
  partNumber?: string | null;
  quantity: number;
  unit: string;
  material?: string | null;
  description?: string | null;
  incoterms?: string | null;
  desiredDeliveryDate?: string | null;
  offerDeadline?: string | null;
  portalUrl: string;
}

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private readonly cacheDir: string;
  private readonly CACHE_TTL_DAYS = 30;

  constructor(
    private readonly geminiService: GeminiService,
    private readonly errorTrackingService: ErrorTrackingService,
  ) {
    // Use /tmp on Cloud Functions (read-only filesystem), cwd otherwise
    this.cacheDir = path.join(
      process.env.K_SERVICE ? os.tmpdir() : process.cwd(),
      '.cache',
      'translations'
    );
    this.initializeCache();
  }

  private initializeCache() {
    if (!fs.existsSync(this.cacheDir)) {
      try {
        fs.mkdirSync(this.cacheDir, { recursive: true });
        this.logger.log(`[TRANSLATION CACHE] Initialized at ${this.cacheDir}`);
      } catch (e) {
        this.logger.error(`[TRANSLATION CACHE] Failed to create directory: ${e.message}`);
      }
    }
  }

  private getCacheKey(langCode: string): string {
    return `portal-ui-${langCode}`;
  }

  private getFromCache(key: string): any | null {
    try {
      const filePath = path.join(this.cacheDir, `${key}.json`);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(content);

        // Check expiration
        const created = new Date(parsed.timestamp);
        const now = new Date();
        const diffDays = Math.ceil(Math.abs(now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays > this.CACHE_TTL_DAYS) {
          this.logger.log(`[CACHE EXPIRY] ${key} is older than ${this.CACHE_TTL_DAYS} days. Invalidating.`);
          fs.unlinkSync(filePath);
          return null;
        }

        return parsed.data;
      }
    } catch (e) {
      this.logger.warn(`[CACHE READ ERROR] ${key}: ${e.message}`);
    }
    return null;
  }

  private saveToCache(key: string, data: any) {
    try {
      const filePath = path.join(this.cacheDir, `${key}.json`);
      fs.writeFileSync(filePath, JSON.stringify({
        timestamp: new Date().toISOString(),
        data,
      }));
      this.logger.log(`[CACHE SAVED] ${key}`);
    } catch (e) {
      this.logger.warn(`[CACHE WRITE ERROR] ${key}: ${e.message}`);
    }
  }

  /**
   * Translate portal UI strings using Gemini
   * Returns full PortalTranslations object in target language
   */
  async translatePortalUI(targetLangCode: string): Promise<any> {
    // English passthrough (source language)
    if (targetLangCode === 'en') {
      return { success: true, language: 'en', translations: ENGLISH_TRANSLATIONS };
    }

    // Check cache
    const cacheKey = this.getCacheKey(targetLangCode);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.logger.debug(`[CACHE HIT] Portal UI translation for ${targetLangCode}`);
      return { success: true, language: targetLangCode, translations: cached, cached: true };
    }

    // Translate via Gemini
    this.logger.log(`[TRANSLATION] Generating portal UI translation for ${targetLangCode}`);

    try {
      const prompt = this.buildPortalUIPrompt(targetLangCode);
      const response = await this.geminiService.generateContent(prompt, 'system', 'translation-portal-ui');

      // Parse JSON response
      const cleanJson = this.extractJSON(response);
      const translated = JSON.parse(cleanJson);

      // Validate structure (basic check)
      if (!translated.steps || !translated.rfq || !translated.pricing) {
        throw new Error('Invalid translation structure returned by Gemini');
      }

      // Save to cache
      this.saveToCache(cacheKey, translated);

      return { success: true, language: targetLangCode, translations: translated, cached: false };
    } catch (error) {
      this.logger.error(`[TRANSLATION ERROR] Portal UI for ${targetLangCode}: ${error.message}`);
      this.errorTrackingService.recordError(error, {
        type: 'API_ERROR',
        service: 'translation',
        context: { targetLangCode, type: 'portal-ui' },
      });

      // Fallback to English
      return {
        success: false,
        language: 'en',
        translations: ENGLISH_TRANSLATIONS,
        error: error.message
      };
    }
  }

  /**
   * Translate email template using Gemini
   * Returns HTML email with translated labels
   */
  async translateEmailTemplate(data: EmailTemplateData, targetLangCode: string): Promise<string> {
    // English passthrough
    if (targetLangCode === 'en') {
      return this.buildEmailHTML(data, {
        greeting: 'Dear Sir/Madam,',
        intro: 'We are sending you a request for quotation regarding the following product. Please submit your offer via our portal or by replying to this email.',
        productLabel: 'Product',
        partNumberLabel: 'Part Number',
        quantityLabel: 'Quantity',
        materialLabel: 'Material',
        descriptionLabel: 'Description',
        incotermsLabel: 'Incoterms',
        deliveryDateLabel: 'Delivery Date',
        deadlinePrefix: 'Offer deadline:',
        ctaButton: 'Submit Offer',
        replyFallback: 'You can also reply directly to this email.',
        copyright: new Date().getFullYear() + ' Procurea',
      });
    }

    this.logger.log(`[TRANSLATION] Generating email template for ${targetLangCode}`);

    try {
      const prompt = this.buildEmailPrompt(data, targetLangCode);
      const response = await this.geminiService.generateContent(prompt, 'system', 'translation-email');

      // Parse JSON response
      const cleanJson = this.extractJSON(response);
      const labels = JSON.parse(cleanJson);

      // Build HTML with translated labels
      return this.buildEmailHTML(data, labels);
    } catch (error) {
      this.logger.error(`[TRANSLATION ERROR] Email for ${targetLangCode}: ${error.message}`);
      this.errorTrackingService.recordError(error, {
        type: 'API_ERROR',
        service: 'translation',
        context: { targetLangCode, type: 'email' },
      });

      // Fallback to English
      return this.buildEmailHTML(data, {
        greeting: 'Dear Sir/Madam,',
        intro: 'We are sending you a request for quotation regarding the following product.',
        productLabel: 'Product',
        partNumberLabel: 'Part Number',
        quantityLabel: 'Quantity',
        materialLabel: 'Material',
        descriptionLabel: 'Description',
        incotermsLabel: 'Incoterms',
        deliveryDateLabel: 'Delivery Date',
        deadlinePrefix: 'Offer deadline:',
        ctaButton: 'Submit Offer',
        replyFallback: 'You can also reply directly to this email.',
        copyright: new Date().getFullYear() + ' Procurea',
      });
    }
  }

  private buildPortalUIPrompt(targetLangCode: string): string {
    return `You are a professional B2B procurement translator. Translate the following portal UI strings from English to ${this.getLanguageName(targetLangCode)}.

CONTEXT: This is a vendor portal where suppliers submit price offers for manufacturing RFQs (Request for Quotation).

RULES:
1. Preserve ALL placeholders exactly: {{productName}}, {{quantity}}, etc.
2. Preserve technical terms: Incoterms, MOQ (Minimum Order Quantity), EAU (Estimated Annual Usage)
3. Maintain professional B2B tone appropriate for manufacturing suppliers
4. Keep "Procurea" brand name untranslated
5. Return ONLY valid JSON matching the input structure
6. Do NOT add explanations or markdown formatting

SOURCE (English):
${JSON.stringify(ENGLISH_TRANSLATIONS, null, 2)}

Return the translated JSON in ${this.getLanguageName(targetLangCode)}:`;
  }

  private buildEmailPrompt(data: EmailTemplateData, targetLangCode: string): string {
    return `You are a professional B2B email translator. Translate the following RFQ email labels from English to ${this.getLanguageName(targetLangCode)}.

CONTEXT: This email invites a supplier to submit a quote for: ${data.productName}

RULES:
1. Translate ONLY the labels, NOT the product data (product name, numbers, dates stay unchanged)
2. Maintain professional B2B procurement tone
3. Keep "Procurea" brand name untranslated
4. Return ONLY valid JSON with these exact keys
5. Do NOT add explanations or markdown

Required JSON structure:
{
  "greeting": "Dear Sir/Madam,",
  "intro": "We are sending you a request for quotation regarding the following product. Please submit your offer via our portal or by replying to this email.",
  "productLabel": "Product",
  "partNumberLabel": "Part Number",
  "quantityLabel": "Quantity",
  "materialLabel": "Material",
  "descriptionLabel": "Description",
  "incotermsLabel": "Incoterms",
  "deliveryDateLabel": "Delivery Date",
  "deadlinePrefix": "Offer deadline:",
  "ctaButton": "Submit Offer",
  "replyFallback": "You can also reply directly to this email.",
  "copyright": "${new Date().getFullYear()} Procurea"
}

Translate to ${this.getLanguageName(targetLangCode)}:`;
  }

  private buildEmailHTML(data: EmailTemplateData, labels: any): string {
    const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
    const tdLabel = `font-family: ${font}; padding: 8px 12px; color: #6B7280; font-size: 13px; white-space: nowrap; vertical-align: top;`;
    const tdValue = `font-family: ${font}; padding: 8px 12px; color: #111827; font-size: 13px;`;

    const rows: string[] = [];
    rows.push(`<tr><td style="${tdLabel}">${labels.productLabel}</td><td style="${tdValue} font-weight: 600;">${data.productName}</td></tr>`);
    if (data.partNumber) rows.push(`<tr><td style="${tdLabel}">${labels.partNumberLabel}</td><td style="${tdValue}">${data.partNumber}</td></tr>`);
    rows.push(`<tr><td style="${tdLabel}">${labels.quantityLabel}</td><td style="${tdValue}">${data.quantity} ${data.unit || 'pcs'}</td></tr>`);
    if (data.material) rows.push(`<tr><td style="${tdLabel}">${labels.materialLabel}</td><td style="${tdValue}">${data.material}</td></tr>`);
    if (data.description) rows.push(`<tr><td style="${tdLabel}">${labels.descriptionLabel}</td><td style="${tdValue}">${data.description}</td></tr>`);
    if (data.incoterms) rows.push(`<tr><td style="${tdLabel}">${labels.incotermsLabel}</td><td style="${tdValue}">${data.incoterms}</td></tr>`);
    if (data.desiredDeliveryDate) rows.push(`<tr><td style="${tdLabel}">${labels.deliveryDateLabel}</td><td style="${tdValue}">${new Date(data.desiredDeliveryDate).toLocaleDateString()}</td></tr>`);

    const deadlineRow = data.offerDeadline ? `
  <tr><td colspan="2" style="padding: 0 0 20px 0; font-family: ${font}; font-size: 13px; color: #854D0E;">
    <div style="background: #FFFBEB; border-left: 3px solid #F59E0B; padding: 10px 14px; border-radius: 0 4px 4px 0;">${labels.deadlinePrefix} <strong>${new Date(data.offerDeadline).toLocaleDateString()}</strong></div>
  </td></tr>` : '';

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #FFFFFF; -webkit-font-smoothing: antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FFFFFF;">
<tr><td align="center" style="padding: 40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">
  <tr><td style="height: 3px; background: #4F46E5;"></td></tr>
  <tr><td style="padding: 28px 0 20px 0; font-family: ${font}; font-size: 18px; font-weight: 700; color: #4F46E5; letter-spacing: -0.3px;">Procurea</td></tr>
  <tr><td style="height: 1px; background: #F1F5F9;"></td></tr>
  <tr><td style="padding: 28px 0 0 0; font-family: ${font}; color: #374151; font-size: 15px; line-height: 1.75;">
    <p style="margin: 0 0 8px 0; font-weight: 500; color: #111827;">${labels.greeting}</p>
    <p style="margin: 0 0 24px 0;">${labels.intro}</p>
  </td></tr>
  <tr><td style="padding: 0 0 24px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FAFAFA; border: 1px solid #F1F5F9; border-radius: 6px;">
      ${rows.join('')}
    </table>
  </td></tr>
  ${deadlineRow}
  <tr><td align="center" style="padding: 8px 0 14px 0;">
    <a href="${data.portalUrl}" style="display: inline-block; background: #4F46E5; color: #FFFFFF; padding: 12px 36px; text-decoration: none; border-radius: 6px; font-family: ${font}; font-weight: 600; font-size: 14px;">${labels.ctaButton}</a>
  </td></tr>
  <tr><td align="center" style="padding: 0 0 28px 0; font-family: ${font}; font-size: 11px; color: #94A3B8;">
    ${labels.replyFallback}
  </td></tr>
  <tr><td style="height: 1px; background: #F1F5F9;"></td></tr>
  <tr><td style="padding: 16px 0 0 0; font-family: ${font}; font-size: 11px; color: #D1D5DB;">&copy; ${labels.copyright}</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
  }

  private extractJSON(text: string): string {
    // Remove markdown code blocks if present
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```\s*/g, '');
    }
    return cleaned.trim();
  }

  private getLanguageName(code: string): string {
    const names: Record<string, string> = {
      'de': 'German', 'fr': 'French', 'it': 'Italian', 'es': 'Spanish',
      'nl': 'Dutch', 'cs': 'Czech', 'sk': 'Slovak', 'hu': 'Hungarian',
      'pt': 'Portuguese', 'ro': 'Romanian', 'bg': 'Bulgarian', 'hr': 'Croatian',
      'sl': 'Slovenian', 'lt': 'Lithuanian', 'lv': 'Latvian', 'et': 'Estonian',
      'fi': 'Finnish', 'sv': 'Swedish', 'da': 'Danish', 'no': 'Norwegian',
      'tr': 'Turkish', 'ja': 'Japanese', 'zh': 'Chinese', 'ko': 'Korean',
      'th': 'Thai', 'vi': 'Vietnamese', 'id': 'Indonesian', 'ms': 'Malay',
      'he': 'Hebrew', 'ar': 'Arabic', 'uk': 'Ukrainian', 'pl': 'Polish',
    };
    return names[code] || 'English';
  }

  /**
   * Clear all cached translations (for testing/admin)
   */
  async clearCache(): Promise<void> {
    try {
      const files = fs.readdirSync(this.cacheDir);
      for (const file of files) {
        fs.unlinkSync(path.join(this.cacheDir, file));
      }
      this.logger.log(`[CACHE CLEARED] ${files.length} cached translations deleted`);
    } catch (e) {
      this.logger.error(`[CACHE CLEAR ERROR] ${e.message}`);
    }
  }
}
