"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequencesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SequencesService = class SequencesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async findOne(id) {
        return this.prisma.sequenceTemplate.findUnique({
            where: { id },
            include: {
                steps: {
                    orderBy: { dayOffset: 'asc' },
                },
            },
        });
    }
    async create(name) {
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
    async updateStep(stepId, data) {
        return this.prisma.sequenceStep.update({
            where: { id: stepId },
            data: {
                subject: data.subject,
                bodySnippet: data.body,
            },
        });
    }
    async ensureDefaultSequenceExists() {
        const existing = await this.prisma.sequenceTemplate.findFirst({
            where: { isSystem: true },
        });
        if (existing) {
            return existing;
        }
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
};
exports.SequencesService = SequencesService;
exports.SequencesService = SequencesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SequencesService);
//# sourceMappingURL=sequences.service.js.map