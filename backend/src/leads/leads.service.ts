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
    this.sendConfirmation(lead).catch((err) => {
      this.logger.warn(`Failed to send confirmation for lead ${lead.id}: ${err.message}`)
    })

    return { id: lead.id, status: 'ok' as const }
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
