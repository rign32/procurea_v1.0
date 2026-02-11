import { PrismaService } from '../../prisma/prisma.service';
import { GeminiService } from './gemini.service';
export interface ColumnInfo {
    name: string;
    type: string;
    isPrimaryKey?: boolean;
    isRequired?: boolean;
    default?: string;
}
export interface RelationInfo {
    name: string;
    type: string;
    relatedTable: string;
}
export interface TableInfo {
    name: string;
    columns: ColumnInfo[];
    relations: RelationInfo[];
    rowCount?: number;
}
export interface QueryResult {
    columns: string[];
    rows: any[];
    rowCount: number;
    executionTime: number;
}
export interface AskResult {
    question: string;
    sql: string;
    explanation: string;
    results: QueryResult;
    error?: string;
}
export declare class DatabaseExplorerService {
    private readonly prisma;
    private readonly geminiService;
    private readonly logger;
    private readonly schemaDefinition;
    constructor(prisma: PrismaService, geminiService: GeminiService);
    getSchema(): Promise<{
        tables: TableInfo[];
    }>;
    getTables(): Promise<{
        name: string;
        rowCount: number;
        columnCount: number;
    }[]>;
    getTableData(tableName: string, limit?: number, offset?: number): Promise<QueryResult>;
    executeQuery(sql: string): Promise<QueryResult>;
    askQuestion(question: string): Promise<AskResult>;
    getStats(): Promise<Record<string, any>>;
}
