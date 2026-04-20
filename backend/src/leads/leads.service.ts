import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Resend } from 'resend'
import { PrismaService } from '../prisma/prisma.service'
import { CreateLeadDto } from './dto/create-lead.dto'

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name)
  private resend: Resend | null = null
  private readonly salesEmail: string

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('RESEND_API_KEY')
    if (apiKey) {
      this.resend = new Resend(apiKey)
    } else {
      this.logger.warn('RESEND_API_KEY missing — lead notifications disabled')
    }
    // Sales inbox — all leads route here. Currently r.ignaczak1@gmail.com because
    // the @procurea.pl / @procurea.io inboxes are temporarily not functional.
    // Override via SALES_INBOX_EMAIL env var if needed.
    this.salesEmail = this.config.get<string>('SALES_INBOX_EMAIL') || 'r.ignaczak1@gmail.com'
  }

  async createLead(dto: CreateLeadDto, meta: { ip?: string; userAgent?: string }) {
    const lead = await this.prisma.lead.create({
      data: {
        name: dto.name.trim(),
        company: dto.company?.trim() || null,
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone?.trim() || null,
        interest: dto.interest,
        message: dto.message?.trim() || null,
        source: dto.source || 'contact_page',
        language: dto.language || 'en',
        utmSource: dto.utmSource || null,
        utmMedium: dto.utmMedium || null,
        utmCampaign: dto.utmCampaign || null,
        ipAddress: meta.ip || null,
        userAgent: meta.userAgent || null,
      },
    })

    this.logger.log(`Lead created: ${lead.id} (${lead.email}, interest=${lead.interest}, source=${lead.source})`)

    // Fire-and-forget notifications (don't block response)
    this.notifySales(lead).catch((err) => {
      this.logger.warn(`Failed to notify sales for lead ${lead.id}: ${err.message}`)
    })

    // Lead-magnet gate submissions get a download-specific email with the file link.
    // All other sources get the generic "thanks, we'll respond" confirmation.
    if (dto.source === 'resource-gate' && dto.resourceSlug) {
      this.sendLeadMagnetDownload(lead, dto.resourceSlug).catch((err) => {
        this.logger.warn(`Failed to send lead magnet email for lead ${lead.id}: ${err.message}`)
      })
    } else {
      this.sendConfirmation(lead).catch((err) => {
        this.logger.warn(`Failed to send confirmation for lead ${lead.id}: ${err.message}`)
      })
    }

    return { id: lead.id, status: 'ok' as const }
  }

  // Registry of available lead magnets — kept in sync with landing/src/content/resources.ts
  // Keyed by resource slug. Values are the public download path (served by Firebase Hosting).
  private readonly LEAD_MAGNETS: Record<
    string,
    { titleEn: string; titlePl: string; downloadPath: string; formatEn: string; formatPl: string }
  > = {
    'rfq-comparison-template': {
      titleEn: 'RFQ Comparison Template',
      titlePl: 'Szablon porównania ofert RFQ',
      downloadPath: '/resources/downloads/rfq-comparison-template/rfq-comparison-template.xlsx',
      formatEn: 'Excel workbook · 3 sheets',
      formatPl: 'Arkusz Excel · 3 zakładki',
    },
    'tco-calculator': {
      titleEn: 'TCO Calculator',
      titlePl: 'Kalkulator TCO',
      downloadPath: '/resources/downloads/tco-calculator/tco-calculator.xlsx',
      formatEn: 'Excel calculator · 3 tabs',
      formatPl: 'Kalkulator Excel · 3 zakładki',
    },
    'supplier-risk-checklist-2026': {
      titleEn: 'Supplier Risk Checklist 2026',
      titlePl: 'Checklista ryzyka dostawcy 2026',
      downloadPath:
        '/resources/downloads/supplier-risk-checklist-2026/supplier-risk-checklist-2026.pdf',
      formatEn: 'PDF · 9 pages',
      formatPl: 'PDF · 9 stron',
    },
    'vendor-scoring-framework': {
      titleEn: 'Vendor Scoring Framework',
      titlePl: 'Framework scoringu dostawcy',
      downloadPath:
        '/resources/downloads/vendor-scoring-framework/vendor-scoring-framework.pdf',
      formatEn: 'PDF · 15 pages',
      formatPl: 'PDF · 15 stron',
    },
    'nearshore-migration-playbook': {
      titleEn: 'Nearshore Migration Playbook',
      titlePl: 'Playbook migracji nearshore',
      downloadPath:
        '/resources/downloads/nearshore-migration-playbook/nearshore-migration-playbook.pdf',
      formatEn: 'PDF · 14 pages',
      formatPl: 'PDF · 14 stron',
    },
  }

  private async sendLeadMagnetDownload(
    lead: { id: string; name: string; email: string; language: string },
    resourceSlug: string,
  ) {
    if (!this.resend) {
      this.logger.warn(`Skipping lead magnet email (no RESEND_API_KEY): ${lead.email} → ${resourceSlug}`)
      return
    }

    const magnet = this.LEAD_MAGNETS[resourceSlug]
    if (!magnet) {
      this.logger.warn(`Unknown lead magnet slug "${resourceSlug}" for lead ${lead.id}`)
      return
    }

    const isEN = lead.language === 'en'
    const fromEmail = isEN ? 'noreply@procurea.io' : 'noreply@procurea.pl'
    const siteBase = isEN ? 'https://procurea.io' : 'https://procurea.pl'
    const downloadUrl = `${siteBase}${magnet.downloadPath}`
    const title = isEN ? magnet.titleEn : magnet.titlePl
    const format = isEN ? magnet.formatEn : magnet.formatPl

    const subject = isEN
      ? `Your download — ${title}`
      : `Twój plik do pobrania — ${title}`

    const text = isEN
      ? `Hi ${lead.name},

Your download is ready: ${title} (${format}).

→ ${downloadUrl}

The file opens in your browser. Save it locally if you want to keep it.

If you have any questions about applying the framework, just reply to this email.

— Procurea team
${siteBase}
`.trim()
      : `Cześć ${lead.name},

Twój plik jest gotowy: ${title} (${format}).

→ ${downloadUrl}

Plik otworzy się w przeglądarce. Zapisz go lokalnie, jeśli chcesz go zatrzymać.

Jeśli masz pytania o zastosowanie frameworka — odpisz na ten email.

— Zespół Procurea
${siteBase}
`.trim()

    const html = isEN
      ? `<p>Hi ${lead.name},</p>
<p>Your download is ready: <strong>${title}</strong> (${format}).</p>
<p><a href="${downloadUrl}" style="display:inline-block;background:#5E8C8F;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Download ${title}</a></p>
<p>The file opens in your browser. Save it locally if you want to keep it.</p>
<p>If you have any questions about applying the framework, just reply to this email.</p>
<p>— Procurea team<br><a href="${siteBase}">${siteBase}</a></p>`
      : `<p>Cześć ${lead.name},</p>
<p>Twój plik jest gotowy: <strong>${title}</strong> (${format}).</p>
<p><a href="${downloadUrl}" style="display:inline-block;background:#5E8C8F;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Pobierz ${title}</a></p>
<p>Plik otworzy się w przeglądarce. Zapisz go lokalnie, jeśli chcesz go zatrzymać.</p>
<p>Jeśli masz pytania o zastosowanie frameworka — odpisz na ten email.</p>
<p>— Zespół Procurea<br><a href="${siteBase}">${siteBase}</a></p>`

    await this.resend.emails.send({
      from: fromEmail,
      to: lead.email,
      subject,
      text,
      html,
    })

    this.logger.log(`Lead magnet email sent: ${lead.email} → ${resourceSlug}`)
  }

  private async notifySales(lead: { id: string; name: string; company: string | null; email: string; phone: string | null; interest: string; message: string | null; source: string; language: string; utmSource: string | null; utmMedium: string | null; utmCampaign: string | null }) {
    if (!this.resend) return

    const fromEmail = lead.language === 'en' ? 'noreply@procurea.io' : 'noreply@procurea.pl'

    const subject = `[Lead] ${lead.interest} — ${lead.name}${lead.company ? ` (${lead.company})` : ''}`

    const body = `
New inbound lead from procurea.${lead.language === 'en' ? 'io' : 'pl'}

Name:      ${lead.name}
Company:   ${lead.company || '—'}
Email:     ${lead.email}
Phone:     ${lead.phone || '—'}
Interest:  ${lead.interest}
Language:  ${lead.language}
Source:    ${lead.source}

${lead.utmSource ? `UTM source:    ${lead.utmSource}\n` : ''}${lead.utmMedium ? `UTM medium:    ${lead.utmMedium}\n` : ''}${lead.utmCampaign ? `UTM campaign:  ${lead.utmCampaign}\n` : ''}
Message:
${lead.message || '(no message)'}

---
Lead ID: ${lead.id}
Reply-to: ${lead.email}
`.trim()

    await this.resend!.emails.send({
      from: fromEmail,
      to: this.salesEmail,
      replyTo: lead.email,
      subject,
      text: body,
    })
  }

  private async sendConfirmation(lead: { id: string; name: string; email: string; language: string }) {
    if (!this.resend) return

    const fromEmail = lead.language === 'en' ? 'noreply@procurea.io' : 'noreply@procurea.pl'
    const isEN = lead.language === 'en'

    const subject = isEN
      ? 'Thanks for reaching out — Procurea'
      : 'Dziękujemy za kontakt — Procurea'

    const body = isEN ? `
Hi ${lead.name},

Thanks for reaching out to Procurea. We received your inquiry and will get back to you within 24 hours with next steps.

If you'd prefer to book a time directly, you can schedule a 30-minute intro call here:
  (Cal.com link — coming soon)

Talk soon,
Procurea team
` : `
Cześć ${lead.name},

Dziękujemy za kontakt z Procurea. Otrzymaliśmy Twoje zapytanie i odezwiemy się w ciągu 24 godzin z kolejnymi krokami.

Jeśli wolisz od razu umówić spotkanie, możesz to zrobić tutaj:
  (Link Cal.com — wkrótce)

Do usłyszenia,
Zespół Procurea
`

    await this.resend!.emails.send({
      from: fromEmail,
      to: lead.email,
      subject,
      text: body.trim(),
    })
  }
}
