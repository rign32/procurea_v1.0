import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CertificatesService } from './certificates.service';
import { EmailService } from '../email/email.service';
import { CERTIFICATE_LABELS, type CertificateType } from './certificate-types';

@Injectable()
export class CertificateExpirySchedulerService {
  private readonly logger = new Logger(CertificateExpirySchedulerService.name);

  constructor(
    private readonly certificates: CertificatesService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Daily 08:00 CET — refresh cached statuses + send expiry alerts.
   * Groups certs by RFQ owner (one email per user, listing all their expiring certs).
   */
  @Cron('0 8 * * *', { timeZone: 'Europe/Warsaw' })
  async dailyExpiryCheck(): Promise<void> {
    this.logger.log('Running certificate expiry check...');
    try {
      await this.certificates.refreshAllStatuses();
      await this.sendExpiryAlerts();
    } catch (err) {
      this.logger.error('Certificate expiry check failed', err);
    }
  }

  async sendExpiryAlerts(): Promise<{ sent: number }> {
    const expiring = await this.certificates.findExpiringForAlert();
    if (expiring.length === 0) {
      this.logger.log('No expiring certificates to alert about');
      return { sent: 0 };
    }

    // Group by owner email (one email per user, summarizing all expiring certs they own).
    // Ownership path: SupplierCertificate → Supplier → Campaign → RfqRequest → User
    type OwnerShape = {
      id: string;
      email: string;
      name: string | null;
      language: string | null;
      organizationId: string | null;
    };
    type Cert = (typeof expiring)[number];
    const byOwner = new Map<string, { owner: OwnerShape; certs: Cert[] }>();
    for (const cert of expiring) {
      const owner = cert.supplier?.campaign?.rfqRequest?.owner;
      if (!owner?.email) continue;
      const key = owner.id;
      const entry = byOwner.get(key);
      if (entry) entry.certs.push(cert);
      else byOwner.set(key, { owner: owner as OwnerShape, certs: [cert] });
    }

    let sent = 0;
    const alertedIds: string[] = [];

    for (const { owner, certs } of byOwner.values()) {
      try {
        const { subject, html } = this.buildAlertEmail(certs, owner.language || 'pl');
        await this.emailService.sendEmail({
          to: owner.email,
          subject,
          html,
          organizationId: owner.organizationId ?? undefined,
          locale: owner.language || 'pl',
        });
        sent++;
        alertedIds.push(...certs.map((c) => c.id));
        this.logger.log(`Expiry alert sent to ${owner.email} (${certs.length} certs)`);
      } catch (err) {
        this.logger.warn(`Failed to send expiry alert to ${owner.email}: ${err}`);
      }
    }

    await this.certificates.markAlerted(alertedIds);
    return { sent };
  }

  private buildAlertEmail(
    certs: Array<{
      type: string;
      code: string;
      validUntil: Date | null;
      status: string;
      supplier: { name?: string | null };
    }>,
    locale: string,
  ): { subject: string; html: string } {
    const isPL = locale === 'pl';
    // Certs without a date never surface in expiry alerts — findExpiringForAlert filters them out,
    // but keep a defensive filter so the renderer never sees a null validUntil.
    const datedCerts = certs.filter((c): c is typeof c & { validUntil: Date } => !!c.validUntil);
    const expired = datedCerts.filter((c) => c.status === 'EXPIRED');

    const subject = isPL
      ? `⚠️ Wygasające certyfikaty dostawców (${datedCerts.length})`
      : `⚠️ Supplier certificates expiring (${datedCerts.length})`;

    const rows = datedCerts
      .map((c) => {
        const days = Math.ceil(
          (c.validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );
        const color =
          days < 0 ? '#dc2626' : days <= 30 ? '#f59e0b' : '#eab308';
        const dateStr = c.validUntil.toISOString().split('T')[0];
        const label = CERTIFICATE_LABELS[c.type as CertificateType] ?? c.type;
        const statusText =
          days < 0
            ? isPL ? `wygasł ${Math.abs(days)} dni temu` : `expired ${Math.abs(days)} days ago`
            : isPL ? `wygasa za ${days} dni` : `expires in ${days} days`;
        return `
          <tr>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">
              <div style="font-weight:600;color:#111827;">${c.supplier?.name ?? 'Supplier'}</div>
              <div style="font-size:13px;color:#6b7280;margin-top:2px;">
                ${label} · ${c.code}
              </div>
            </td>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:right;">
              <div style="font-family:monospace;color:#111827;">${dateStr}</div>
              <div style="font-size:12px;color:${color};font-weight:600;margin-top:2px;">
                ${statusText}
              </div>
            </td>
          </tr>`;
      })
      .join('');

    const intro = isPL
      ? `Masz <strong>${certs.length}</strong> certyfikatów dostawców, które ${
          expired.length > 0 ? 'wygasły lub wygasną' : 'wygasną'
        } w ciągu 90 dni. Poniżej lista — zaktualizuj je w Procurea.`
      : `You have <strong>${certs.length}</strong> supplier certificates that ${
          expired.length > 0 ? 'have expired or will expire' : 'will expire'
        } within 90 days. Review the list below and refresh them in Procurea.`;

    const footer = isPL
      ? 'Otrzymujesz ten mail, bo jesteś właścicielem RFQ powiązanego z tymi dostawcami. Alerty są wysyłane maks. raz na kilka dni.'
      : 'You are receiving this because you own RFQs linked to these suppliers. Alerts are batched and sent at most once every few days.';

    const html = `
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <tr>
          <td style="padding:24px 14px;">
            <h2 style="margin:0 0 12px 0;font-size:20px;color:#111827;">${subject}</h2>
            <p style="margin:0 0 18px 0;font-size:14px;color:#374151;line-height:1.5;">${intro}</p>

            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
              ${rows}
            </table>

            <p style="margin:20px 0 0 0;font-size:12px;color:#9ca3af;">${footer}</p>
          </td>
        </tr>
      </table>
    `.trim();

    return { subject, html };
  }
}
