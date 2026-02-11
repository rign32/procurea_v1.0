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
}
