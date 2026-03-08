import { SequencesService } from './sequences.service';
export declare class SequencesController {
    private readonly sequencesService;
    constructor(sequencesService: SequencesService);
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
    deleteTemplate(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isSystem: boolean;
    }>;
    cloneTemplate(id: string, name: string): Promise<{
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
    addStep(templateId: string, body: {
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
    updateStep(id: string, body: {
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
    deleteStep(id: string): Promise<{
        id: string;
        subject: string;
        type: string;
        dayOffset: number;
        bodySnippet: string;
        templateId: string;
    }>;
}
