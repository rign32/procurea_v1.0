import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportsService } from '../reports/reports.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class ScheduledReportsService {
    private readonly logger = new Logger(ScheduledReportsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly reportsService: ReportsService,
        private readonly emailService: EmailService,
    ) {}

    async findAll(userId: string) {
        return this.prisma.scheduledReport.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(userId: string, data: {
        name: string;
        frequency: string;
        reportType: string;
        recipients: string[];
        filters?: Record<string, any>;
    }) {
        return this.prisma.scheduledReport.create({
            data: {
                userId,
                name: data.name,
                frequency: data.frequency,
                reportType: data.reportType,
                recipients: data.recipients,
                filters: data.filters || {},
                enabled: true,
            },
        });
    }

    async remove(id: string, userId: string) {
        const report = await this.prisma.scheduledReport.findUnique({ where: { id } });
        if (!report) throw new NotFoundException('Scheduled report not found');
        if (report.userId !== userId) throw new ForbiddenException('Not your report');

        await this.prisma.scheduledReport.delete({ where: { id } });
        return { success: true };
    }

    async runNow(id: string, userId: string) {
        const report = await this.prisma.scheduledReport.findUnique({ where: { id } });
        if (!report) throw new NotFoundException('Scheduled report not found');
        if (report.userId !== userId) throw new ForbiddenException('Not your report');

        await this.generateAndSend(report);
        return { success: true, sentTo: report.recipients };
    }

    /**
     * Called by Cloud Scheduler cron job.
     * Processes all enabled scheduled reports based on their frequency.
     */
    async processScheduledReports() {
        const now = new Date();
        const reports = await this.prisma.scheduledReport.findMany({
            where: { enabled: true },
        });

        let processed = 0;
        let failed = 0;

        for (const report of reports) {
            if (!this.shouldRun(report, now)) continue;

            try {
                await this.generateAndSend(report);
                await this.prisma.scheduledReport.update({
                    where: { id: report.id },
                    data: { lastRunAt: now },
                });
                processed++;
            } catch (err) {
                this.logger.error(`Failed to process scheduled report ${report.id}: ${err.message}`);
                failed++;
            }
        }

        this.logger.log(`Processed ${processed} scheduled reports, ${failed} failed`);
        return { processed, failed };
    }

    private shouldRun(report: any, now: Date): boolean {
        const lastRun = report.lastRunAt ? new Date(report.lastRunAt) : null;
        if (!lastRun) return true; // Never run before

        const hoursSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60);

        switch (report.frequency) {
            case 'daily':
                return hoursSinceLastRun >= 23;
            case 'weekly':
                return hoursSinceLastRun >= 167; // ~7 days
            case 'monthly':
                return hoursSinceLastRun >= 720; // ~30 days
            default:
                return false;
        }
    }

    private async generateAndSend(report: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: report.userId },
            select: { name: true, email: true, language: true },
        });

        let reportData: any;
        let subject: string;

        switch (report.reportType) {
            case 'analytics':
                reportData = await this.reportsService.getAnalytics();
                subject = `Procurea Analytics Report — ${report.name}`;
                break;
            case 'supplier_performance':
                reportData = await this.reportsService.getSupplierPerformance(20);
                subject = `Procurea Supplier Performance — ${report.name}`;
                break;
            case 'campaign_summary':
            default:
                reportData = await this.reportsService.getFunnel();
                subject = `Procurea Campaign Summary — ${report.name}`;
                break;
        }

        const recipients = report.recipients as string[];
        const htmlBody = this.buildEmailHtml(report.reportType, reportData, report.name);

        for (const email of recipients) {
            try {
                await this.emailService.sendEmail({
                    to: email,
                    subject,
                    html: htmlBody,
                });
            } catch (err) {
                this.logger.warn(`Failed to send report to ${email}: ${err.message}`);
            }
        }
    }

    private buildEmailHtml(type: string, data: any, name: string): string {
        const headerStyle = 'font-family: Arial, sans-serif; color: #1a1a1a;';
        const cardStyle = 'background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 8px 0;';

        let content = '';

        if (type === 'analytics' && data) {
            content = `
                <div style="${cardStyle}">
                    <strong>Campaigns:</strong> ${data.funnel?.totalCampaigns ?? 0}<br/>
                    <strong>Total Suppliers:</strong> ${data.quality?.totalSuppliers ?? 0}<br/>
                    <strong>Avg Capability Score:</strong> ${data.quality?.avgCapabilityScore?.toFixed(1) ?? 'N/A'}<br/>
                    <strong>Total Cost:</strong> $${data.cost?.totalCost?.toFixed(2) ?? '0.00'}
                </div>
            `;
        } else if (type === 'supplier_performance' && Array.isArray(data)) {
            content = `
                <table style="width:100%; border-collapse: collapse;">
                    <tr style="background:#f0f0f0;"><th style="padding:8px;text-align:left;">Supplier</th><th style="padding:8px;">Score</th><th style="padding:8px;">Country</th></tr>
                    ${data.slice(0, 10).map((s: any) => `
                        <tr><td style="padding:8px;">${s.name || '—'}</td><td style="padding:8px;text-align:center;">${s.analysisScore ?? '—'}</td><td style="padding:8px;">${s.country || '—'}</td></tr>
                    `).join('')}
                </table>
            `;
        } else {
            content = `<pre style="font-size:12px;">${JSON.stringify(data, null, 2).substring(0, 2000)}</pre>`;
        }

        return `
            <div style="${headerStyle}">
                <h2>📊 ${name}</h2>
                <p style="color:#666;">Automated report from Procurea</p>
                ${content}
                <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
                <p style="font-size:12px;color:#999;">This is an automated report. Manage your scheduled reports at <a href="https://app.procurea.pl/settings">Settings</a>.</p>
            </div>
        `;
    }
}
