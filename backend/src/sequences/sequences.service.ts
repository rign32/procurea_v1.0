import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SequencesService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.sequenceTemplate.findMany({
            include: {
                steps: {
                    orderBy: { dayOffset: 'asc' },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.sequenceTemplate.findUnique({
            where: { id },
            include: {
                steps: {
                    orderBy: { dayOffset: 'asc' },
                },
            },
        });
    }

    async create(name: string) {
        return this.prisma.sequenceTemplate.create({
            data: {
                name,
                isSystem: false,
                steps: {
                    create: [
                        {
                            dayOffset: 0,
                            type: 'INITIAL',
                            subject: 'Zapytanie Ofertowe: {{Product_Name}}',
                            bodySnippet: 'Dzień dobry,\n\nZwracamy się z prośbą o przedstawienie oferty na {{Product_Name}}.\n\nSzczegóły w załączeniu.',
                        },
                        {
                            dayOffset: 3,
                            type: 'REMINDER',
                            subject: 'Przypomnienie: RFQ {{Product_Name}}',
                            bodySnippet: 'Dzień dobry,\n\nPrzypominamy o naszym zapytaniu. Czy planują Państwo złożyć ofertę?',
                        },
                    ],
                },
            },
            include: { steps: true },
        });
    }

    async updateStep(stepId: string, data: { subject?: string; body?: string }) {
        // In strict mode we should check ID int vs string, but schema says String uuid now.
        // If schema was Int, this would fail. schema said String @id @default(uuid()).
        return this.prisma.sequenceStep.update({
            where: { id: stepId }, // schema uses String ID
            data: {
                subject: data.subject,
                bodySnippet: data.body,
            },
        });
    }

    /**
     * Ensure a default sequence exists. Called during onboarding.
     * Returns the default sequence or creates one if none exist.
     */
    async ensureDefaultSequenceExists() {
        const existing = await this.prisma.sequenceTemplate.findFirst({
            where: { isSystem: true },
        });

        if (existing) {
            return existing;
        }

        // Create default system sequence
        return this.prisma.sequenceTemplate.create({
            data: {
                name: 'Standardowa Sekwencja RFQ',
                isSystem: true,
                steps: {
                    create: [
                        {
                            dayOffset: 0,
                            type: 'INITIAL',
                            subject: 'Zapytanie Ofertowe: {{Product_Name}}',
                            bodySnippet: 'Dzień dobry,\n\nZwracamy się z prośbą o przedstawienie oferty na {{Product_Name}}.\n\nZ poważaniem,\n{{Sender_Name}}\n{{Sender_Company}}',
                        },
                        {
                            dayOffset: 3,
                            type: 'REMINDER',
                            subject: 'Przypomnienie: RFQ {{Product_Name}}',
                            bodySnippet: 'Dzień dobry,\n\nPrzypominamy o naszym zapytaniu ofertowym dotyczącym {{Product_Name}}.\n\nCzy planują Państwo złożyć ofertę?\n\nZ poważaniem,\n{{Sender_Name}}',
                        },
                        {
                            dayOffset: 7,
                            type: 'FINAL',
                            subject: 'Ostatnie przypomnienie: RFQ {{Product_Name}}',
                            bodySnippet: 'Dzień dobry,\n\nTo nasze ostatnie przypomnienie dotyczące zapytania na {{Product_Name}}.\n\nProsimy o odpowiedź do końca tygodnia.\n\nZ poważaniem,\n{{Sender_Name}}',
                        },
                    ],
                },
            },
            include: { steps: true },
        });
    }
}
