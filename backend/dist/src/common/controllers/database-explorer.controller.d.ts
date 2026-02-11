import { DatabaseExplorerService } from '../services/database-explorer.service';
export declare class DatabaseExplorerController {
    private readonly dbExplorer;
    constructor(dbExplorer: DatabaseExplorerService);
    getSchema(): Promise<{
        tables: import("../services/database-explorer.service").TableInfo[];
    }>;
    getTables(): Promise<{
        name: string;
        rowCount: number;
        columnCount: number;
    }[]>;
    getTableData(name: string, limit?: string, offset?: string): Promise<import("../services/database-explorer.service").QueryResult>;
    getStats(): Promise<Record<string, any>>;
    executeQuery(body: {
        sql: string;
    }): Promise<import("../services/database-explorer.service").QueryResult>;
    askQuestion(body: {
        question: string;
    }): Promise<import("../services/database-explorer.service").AskResult>;
}
