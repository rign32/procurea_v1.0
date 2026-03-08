import { PrismaService } from '../prisma/prisma.service';
export declare class SequencesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        steps: {
            id: string;
            subject: string;
            type: string;
            dayOffset: number;
            bodySnippet: string;
            templateId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isSystem: boolean;
    })[]>;
    findOne(id: string): Promise<({
        steps: {
            id: string;
            subject: string;
            type: string;
            dayOffset: number;
            bodySnippet: string;
            templateId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isSystem: boolean;
    }) | null>;
    create(name: string): Promise<{
        steps: {
            id: string;
            subject: string;
            type: string;
            dayOffset: number;
            bodySnippet: string;
            templateId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isSystem: boolean;
    }>;
    updateStep(stepId: string, data: {
        subject?: string;
        body?: string;
    }): Promise<{
        id: string;
        subject: string;
        type: string;
        dayOffset: number;
        bodySnippet: string;
        templateId: string;
    }>;
    deleteTemplate(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isSystem: boolean;
    }>;
    addStep(templateId: string, data: {
        dayOffset: number;
        type: string;
        subject: string;
        bodySnippet: string;
    }): Promise<{
        id: string;
        subject: string;
        type: string;
        dayOffset: number;
        bodySnippet: string;
        templateId: string;
    }>;
    deleteStep(stepId: string): Promise<{
        id: string;
        subject: string;
        type: string;
        dayOffset: number;
        bodySnippet: string;
        templateId: string;
    }>;
    cloneTemplate(id: string, newName: string): Promise<{
        steps: {
            id: string;
            subject: string;
            type: string;
            dayOffset: number;
            bodySnippet: string;
            templateId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isSystem: boolean;
    }>;
    ensureDefaultSequenceExists(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isSystem: boolean;
    }>;
}
