import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
                            bodySnippet: 'Szanowni Państwo z {{Supplier_Name}},\n\nZwracamy się z prośbą o przedstawienie oferty na {{Product_Name}}.\n\nIlość: {{Quantity}} {{Currency}}\n\nSzczegóły zapytania znajdą Państwo pod poniższym linkiem.\n\nZ poważaniem,\n{{Sender_Name}}\n{{Sender_Company}}',
                        },
                        {
                            dayOffset: 3,
                            type: 'REMINDER',
                            subject: 'Przypomnienie: RFQ {{Product_Name}}',
                            bodySnippet: 'Szanowni Państwo z {{Supplier_Name}},\n\nPrzypominamy o naszym zapytaniu ofertowym dotyczącym {{Product_Name}}.\n\nCzy planują Państwo złożyć ofertę? Będziemy wdzięczni za odpowiedź.\n\nZ poważaniem,\n{{Sender_Name}}\n{{Sender_Company}}',
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

    async deleteTemplate(id: string) {
        const template = await this.prisma.sequenceTemplate.findUnique({ where: { id } });
        if (!template) throw new NotFoundException('Template not found');
        if (template.isSystem) throw new BadRequestException('Cannot delete system templates');

        // Check if any campaign uses this template
        const campaignCount = await this.prisma.campaign.count({
            where: { sequenceTemplateId: id },
        });
        if (campaignCount > 0) {
            throw new BadRequestException(`Template is used by ${campaignCount} campaign(s). Unlink them first.`);
        }

        return this.prisma.sequenceTemplate.delete({ where: { id } });
    }

    async addStep(templateId: string, data: { dayOffset: number; type: string; subject: string; bodySnippet: string }) {
        const template = await this.prisma.sequenceTemplate.findUnique({ where: { id: templateId } });
        if (!template) throw new NotFoundException('Template not found');
        if (template.isSystem) throw new BadRequestException('Cannot modify system templates. Clone it first.');

        return this.prisma.sequenceStep.create({
            data: {
                templateId,
                dayOffset: data.dayOffset,
                type: data.type,
                subject: data.subject,
                bodySnippet: data.bodySnippet,
            },
        });
    }

    async deleteStep(stepId: string) {
        const step = await this.prisma.sequenceStep.findUnique({
            where: { id: stepId },
            include: { template: true },
        });
        if (!step) throw new NotFoundException('Step not found');
        if (step.template.isSystem) throw new BadRequestException('Cannot modify system templates');

        // Don't allow deleting the only step
        const stepCount = await this.prisma.sequenceStep.count({
            where: { templateId: step.templateId },
        });
        if (stepCount <= 1) {
            throw new BadRequestException('Cannot delete the last step. Delete the template instead.');
        }

        return this.prisma.sequenceStep.delete({ where: { id: stepId } });
    }

    async cloneTemplate(id: string, newName: string) {
        const template = await this.prisma.sequenceTemplate.findUnique({
            where: { id },
            include: { steps: { orderBy: { dayOffset: 'asc' } } },
        });
        if (!template) throw new NotFoundException('Template not found');

        return this.prisma.sequenceTemplate.create({
            data: {
                name: newName,
                isSystem: false,
                steps: {
                    create: template.steps.map(s => ({
                        dayOffset: s.dayOffset,
                        type: s.type,
                        subject: s.subject,
                        bodySnippet: s.bodySnippet,
                    })),
                },
            },
            include: { steps: true },
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
                            bodySnippet: 'Szanowni Państwo z {{Supplier_Name}},\n\nZwracamy się z prośbą o przedstawienie oferty na {{Product_Name}}.\n\nIlość: {{Quantity}} {{Currency}}\n\nSzczegóły zapytania znajdą Państwo pod poniższym linkiem.\n\nZ poważaniem,\n{{Sender_Name}}\n{{Sender_Company}}',
                        },
                        {
                            dayOffset: 3,
                            type: 'REMINDER',
                            subject: 'Przypomnienie: RFQ {{Product_Name}}',
                            bodySnippet: 'Szanowni Państwo z {{Supplier_Name}},\n\nPrzypominamy o naszym zapytaniu ofertowym dotyczącym {{Product_Name}}.\n\nCzy planują Państwo złożyć ofertę? Będziemy wdzięczni za odpowiedź.\n\nZ poważaniem,\n{{Sender_Name}}\n{{Sender_Company}}',
                        },
                        {
                            dayOffset: 7,
                            type: 'FINAL',
                            subject: 'Ostatnie przypomnienie: RFQ {{Product_Name}}',
                            bodySnippet: 'Szanowni Państwo z {{Supplier_Name}},\n\nTo nasze ostatnie przypomnienie dotyczące zapytania na {{Product_Name}}.\n\nProsimy o odpowiedź do końca tygodnia.\n\nZ poważaniem,\n{{Sender_Name}}\n{{Sender_Company}}',
                        },
                    ],
                },
            },
            include: { steps: true },
        });
    }
}
