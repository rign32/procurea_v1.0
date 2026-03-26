import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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


@Injectable()
export class DatabaseExplorerService {
    private readonly logger = new Logger(DatabaseExplorerService.name);

    // Define schema based on Prisma models
    private readonly schemaDefinition: TableInfo[] = [
        {
            name: 'User',
            columns: [
                { name: 'id', type: 'String', isPrimaryKey: true },
                { name: 'email', type: 'String', isRequired: true },
                { name: 'name', type: 'String' },
                { name: 'role', type: 'String', default: 'USER' },
                { name: 'organizationId', type: 'String' },
                { name: 'lastLoginAt', type: 'DateTime' },
                { name: 'createdAt', type: 'DateTime' },
            ],
            relations: [
                { name: 'organization', type: 'Organization?', relatedTable: 'Organization' },
                { name: 'ownedRfqs', type: 'RfqRequest[]', relatedTable: 'RfqRequest' },
            ],
        },
        {
            name: 'Organization',
            columns: [
                { name: 'id', type: 'String', isPrimaryKey: true },
                { name: 'name', type: 'String', isRequired: true },
                { name: 'domain', type: 'String' },
                { name: 'createdAt', type: 'DateTime' },
            ],
            relations: [
                { name: 'users', type: 'User[]', relatedTable: 'User' },
            ],
        },
        {
            name: 'AuditLog',
            columns: [
                { name: 'id', type: 'String', isPrimaryKey: true },
                { name: 'userId', type: 'String', isRequired: true },
                { name: 'action', type: 'String', isRequired: true },
                { name: 'entityType', type: 'String', isRequired: true },
                { name: 'entityId', type: 'String', isRequired: true },
                { name: 'changes', type: 'String' },
                { name: 'metadata', type: 'String' },
                { name: 'createdAt', type: 'DateTime' },
            ],
            relations: [
                { name: 'user', type: 'User', relatedTable: 'User' },
            ],
        },
        {
            name: 'Campaign',
            columns: [
                { name: 'id', type: 'String', isPrimaryKey: true },
                { name: 'name', type: 'String' },
                { name: 'status', type: 'String', default: 'RUNNING' },
                { name: 'stage', type: 'String', default: 'STRATEGY' },
                { name: 'createdAt', type: 'DateTime' },
                { name: 'updatedAt', type: 'DateTime' },
                { name: 'deletedAt', type: 'DateTime' },
            ],
            relations: [
                { name: 'logs', type: 'Log[]', relatedTable: 'Log' },
                { name: 'suppliers', type: 'Supplier[]', relatedTable: 'Supplier' },
                { name: 'rfqRequest', type: 'RfqRequest?', relatedTable: 'RfqRequest' },
            ],
        },
        {
            name: 'Supplier',
            columns: [
                { name: 'id', type: 'String', isPrimaryKey: true },
                { name: 'campaignId', type: 'String', isRequired: true },
                { name: 'url', type: 'String', isRequired: true },
                { name: 'name', type: 'String' },
                { name: 'country', type: 'String' },
                { name: 'city', type: 'String' },
                { name: 'website', type: 'String' },
                { name: 'specialization', type: 'String' },
                { name: 'certificates', type: 'String' },
                { name: 'employeeCount', type: 'String' },
                { name: 'contactEmails', type: 'String' },
                { name: 'analysisScore', type: 'Float' },
                { name: 'analysisReason', type: 'String' },
                { name: 'originLanguage', type: 'String' },
                { name: 'originCountry', type: 'String' },
                { name: 'sourceAgent', type: 'String' },
                { name: 'metadata', type: 'String' },
                { name: 'deletedAt', type: 'DateTime' },
            ],
            relations: [
                { name: 'campaign', type: 'Campaign', relatedTable: 'Campaign' },
                { name: 'offers', type: 'Offer[]', relatedTable: 'Offer' },
                { name: 'documentChunks', type: 'DocumentChunk[]', relatedTable: 'DocumentChunk' },
            ],
        },
        {
            name: 'DocumentChunk',
            columns: [
                { name: 'id', type: 'String', isPrimaryKey: true },
                { name: 'content', type: 'String', isRequired: true },
                { name: 'sourceUrl', type: 'String' },
                { name: 'supplierId', type: 'String' },
                { name: 'createdAt', type: 'DateTime' },
            ],
            relations: [
                { name: 'supplier', type: 'Supplier?', relatedTable: 'Supplier' },
            ],
        },
        {
            name: 'AiInteraction',
            columns: [
                { name: 'id', type: 'String', isPrimaryKey: true },
                { name: 'userId', type: 'String' },
                { name: 'campaignId', type: 'String' },
                { name: 'prompt', type: 'String', isRequired: true },
                { name: 'response', type: 'String', isRequired: true },
                { name: 'modelUsed', type: 'String', isRequired: true },
                { name: 'tokensUsed', type: 'Int' },
                { name: 'feedback', type: 'Int' },
                { name: 'createdAt', type: 'DateTime' },
            ],
            relations: [
                { name: 'user', type: 'User?', relatedTable: 'User' },
            ],
        },
        {
            name: 'Log',
            columns: [
                { name: 'id', type: 'String', isPrimaryKey: true },
                { name: 'campaignId', type: 'String', isRequired: true },
                { name: 'message', type: 'String', isRequired: true },
                { name: 'timestamp', type: 'DateTime' },
            ],
            relations: [
                { name: 'campaign', type: 'Campaign', relatedTable: 'Campaign' },
            ],
        },
        {
            name: 'CompanyRegistry',
            columns: [
                { name: 'id', type: 'String', isPrimaryKey: true },
                { name: 'domain', type: 'String', isRequired: true },
                { name: 'name', type: 'String' },
                { name: 'country', type: 'String' },
                { name: 'city', type: 'String' },
                { name: 'specialization', type: 'String' },
                { name: 'certificates', type: 'String' },
                { name: 'employeeCount', type: 'String' },
                { name: 'contactEmails', type: 'String' },
                { name: 'primaryEmail', type: 'String' },
                { name: 'lastAnalysisScore', type: 'Float' },
                { name: 'dataQualityScore', type: 'Float' },
                { name: 'usageCount', type: 'Int' },
                { name: 'campaignsCount', type: 'Int' },
                { name: 'rfqsSent', type: 'Int' },
                { name: 'rfqsResponded', type: 'Int' },
                { name: 'responseRate', type: 'Float' },
                { name: 'isActive', type: 'Boolean' },
                { name: 'isVerified', type: 'Boolean' },
                { name: 'isBlacklisted', type: 'Boolean' },
                { name: 'vectorId', type: 'String' },
                { name: 'createdAt', type: 'DateTime' },
                { name: 'lastUpdatedAt', type: 'DateTime' },
            ],
            relations: [],
        },
        {
            name: 'RfqRequest',
            columns: [
                { name: 'id', type: 'String', isPrimaryKey: true },
                { name: 'status', type: 'String', default: 'DRAFT' },
                { name: 'publicId', type: 'String' },
                { name: 'productName', type: 'String', isRequired: true },
                { name: 'partNumber', type: 'String' },
                { name: 'category', type: 'String' },
                { name: 'material', type: 'String' },
                { name: 'description', type: 'String' },
                { name: 'targetPrice', type: 'Decimal' },
                { name: 'currency', type: 'String', default: 'EUR' },
                { name: 'quantity', type: 'Int', isRequired: true },
                { name: 'eau', type: 'Int' },
                { name: 'unit', type: 'String', default: 'pcs' },
                { name: 'incoterms', type: 'String' },
                { name: 'deliveryAddress', type: 'String' },
                { name: 'desiredLeadTime', type: 'Int' },
                { name: 'campaignId', type: 'String' },
                { name: 'ownerId', type: 'String' },
                { name: 'deletedAt', type: 'DateTime' },
                { name: 'createdAt', type: 'DateTime' },
                { name: 'updatedAt', type: 'DateTime' },
            ],
            relations: [
                { name: 'campaign', type: 'Campaign?', relatedTable: 'Campaign' },
                { name: 'offers', type: 'Offer[]', relatedTable: 'Offer' },
                { name: 'owner', type: 'User?', relatedTable: 'User' },
            ],
        },
        {
            name: 'Offer',
            columns: [
                { name: 'id', type: 'String', isPrimaryKey: true },
                { name: 'status', type: 'String', default: 'PENDING' },
                { name: 'price', type: 'Decimal' },
                { name: 'currency', type: 'String', default: 'EUR' },
                { name: 'moq', type: 'Int' },
                { name: 'leadTime', type: 'Int' },
                { name: 'validityDate', type: 'DateTime' },
                { name: 'incotermsConfirmed', type: 'Boolean' },
                { name: 'specsConfirmed', type: 'Boolean' },
                { name: 'comments', type: 'String' },
                { name: 'rfqRequestId', type: 'String', isRequired: true },
                { name: 'supplierId', type: 'String', isRequired: true },
                { name: 'accessToken', type: 'String' },
                { name: 'viewedAt', type: 'DateTime' },
                { name: 'submittedAt', type: 'DateTime' },
                { name: 'createdAt', type: 'DateTime' },
                { name: 'updatedAt', type: 'DateTime' },
            ],
            relations: [
                { name: 'rfqRequest', type: 'RfqRequest', relatedTable: 'RfqRequest' },
                { name: 'supplier', type: 'Supplier', relatedTable: 'Supplier' },
            ],
        },
        {
            name: 'SearchQueryCache',
            columns: [
                { name: 'id', type: 'String', isPrimaryKey: true },
                { name: 'queryHash', type: 'String', isRequired: true },
                { name: 'queryText', type: 'String', isRequired: true },
                { name: 'results', type: 'String', isRequired: true },
                { name: 'createdAt', type: 'DateTime' },
                { name: 'expiresAt', type: 'DateTime' },
            ],
            relations: [],
        },
    ];

    constructor(
        private readonly prisma: PrismaService,
        private readonly geminiService: GeminiService,
    ) { }

    /**
     * Get full schema information
     */
    private readonly ALLOWED_TABLES = new Set(
        ['User', 'Organization', 'AuditLog', 'Campaign', 'Supplier', 'DocumentChunk',
         'AiInteraction', 'Log', 'CompanyRegistry', 'RfqRequest', 'Offer', 'SearchQueryCache']
    );

    private isAllowedTable(name: string): boolean {
        return this.ALLOWED_TABLES.has(name);
    }

    async getSchema(): Promise<{ tables: TableInfo[] }> {
        const tablesWithCounts = await Promise.all(
            this.schemaDefinition.map(async (table) => {
                let rowCount = 0;
                if (!this.isAllowedTable(table.name)) return { ...table, rowCount };
                try {
                    const result = await this.prisma.$queryRaw(
                        Prisma.sql`SELECT COUNT(*) as count FROM ${Prisma.raw(`"${table.name}"`)}`
                    ) as any[];
                    rowCount = Number(result[0]?.count || 0);
                } catch (e) {
                    this.logger.warn(`Could not get count for ${table.name}: ${e.message}`);
                }
                return { ...table, rowCount };
            })
        );

        return { tables: tablesWithCounts };
    }

    /**
     * Get list of tables with row counts
     */
    async getTables(): Promise<{ name: string; rowCount: number; columnCount: number }[]> {
        const schema = await this.getSchema();
        return schema.tables.map((t) => ({
            name: t.name,
            rowCount: t.rowCount || 0,
            columnCount: t.columns.length,
        }));
    }

    /**
     * Get data from a specific table with pagination
     */
    async getTableData(
        tableName: string,
        limit: number = 50,
        offset: number = 0,
    ): Promise<QueryResult> {
        const validTable = this.schemaDefinition.find(
            (t) => t.name.toLowerCase() === tableName.toLowerCase()
        );

        if (!validTable || !this.isAllowedTable(validTable.name)) {
            throw new Error(`Table "${tableName}" not found or not accessible`);
        }

        const safeLimit = Math.min(Math.max(0, Math.floor(limit)), 100);
        const safeOffset = Math.max(0, Math.floor(offset));

        const startTime = Date.now();
        const results = await this.prisma.$queryRaw(
            Prisma.sql`SELECT * FROM ${Prisma.raw(`"${validTable.name}"`)} LIMIT ${safeLimit} OFFSET ${safeOffset}`
        ) as any[];
        const executionTime = Date.now() - startTime;

        const columns = results.length > 0 ? Object.keys(results[0]) : [];
        return { columns, rows: results, rowCount: results.length, executionTime };
    }

    /**
     * Execute a SELECT-only query
     */
    async executeQuery(sql: string): Promise<QueryResult> {
        // Strip comments (block and line) to prevent bypass
        const cleanedSql = sql
            .replace(/\/\*[\s\S]*?\*\//g, ' ')
            .replace(/--[^\n]*/g, ' ')
            .trim();

        // Security: Only allow SELECT statements (case-insensitive)
        if (!/^SELECT\b/i.test(cleanedSql)) {
            throw new Error('Only SELECT queries are allowed for security reasons');
        }

        // Block dangerous keywords (word-boundary matching, case-insensitive)
        const dangerousKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'CREATE', 'GRANT', 'REVOKE', 'EXEC', 'EXECUTE', 'INTO'];
        for (const keyword of dangerousKeywords) {
            if (new RegExp(`\\b${keyword}\\b`, 'i').test(cleanedSql)) {
                throw new Error(`Query contains forbidden keyword: ${keyword}`);
            }
        }

        // Validate all referenced tables are in the allowed set
        const tableReferences = cleanedSql.match(/"([A-Z][a-zA-Z]+)"/g);
        if (tableReferences) {
            for (const ref of tableReferences) {
                const tableName = ref.replace(/"/g, '');
                if (!this.isAllowedTable(tableName)) {
                    throw new Error(`Query references unknown table: ${tableName}`);
                }
            }
        }

        // Enforce LIMIT to prevent full table scans
        if (!/\bLIMIT\b/i.test(cleanedSql)) {
            throw new Error('Query must include a LIMIT clause (max 100)');
        }

        const startTime = Date.now();

        try {
            const results = await this.prisma.$queryRawUnsafe(cleanedSql) as any[];
            const executionTime = Date.now() - startTime;

            const columns = results.length > 0 ? Object.keys(results[0]) : [];

            return {
                columns,
                rows: results,
                rowCount: results.length,
                executionTime,
            };
        } catch (error) {
            this.logger.error(`Query failed: ${error.message}`);
            throw new Error('Query execution failed');
        }
    }

    /**
     * Generate SQL from natural language using AI
     */
    async askQuestion(question: string): Promise<AskResult> {
        this.logger.log(`Processing question: ${question}`);

        // Build schema context for AI
        const schemaContext = this.schemaDefinition
            .map((table) => {
                const cols = table.columns.map((c) => `${c.name} (${c.type})`).join(', ');
                const rels = table.relations.length > 0
                    ? ` | Relations: ${table.relations.map((r) => `${r.name} → ${r.relatedTable}`).join(', ')}`
                    : '';
                return `- ${table.name}: ${cols}${rels}`;
            })
            .join('\n');

        const prompt = `Jesteś ekspertem SQL dla bazy PostgreSQL. Na podstawie schematu bazy danych, wygeneruj zapytanie SQL dla podanego pytania.

SCHEMAT BAZY DANYCH:
${schemaContext}

ZASADY:
1. Używaj TYLKO tabel i kolumn które istnieją w schemacie
2. Nazwy tabel i kolumn w PostgreSQL wymagają cudzysłowów dla camelCase, np. "campaignId"
3. Generuj TYLKO zapytania SELECT (bez DELETE, UPDATE, INSERT)
4. Ogranicz wyniki do max 100 rekordów (LIMIT 100)
5. Dla agregatów GROUP BY wymagane są wszystkie kolumny które nie są agregatami

PYTANIE: ${question}

Odpowiedz TYLKO w formacie JSON:
{
  "sql": "SELECT ... FROM ... (kompletne zapytanie SQL)",
  "explanation": "Krótkie wyjaśnienie po polsku co robi to zapytanie"
}`;

        try {
            const response = await this.geminiService.generateContent(prompt);

            // Parse AI response
            let parsed: { sql: string; explanation: string };
            try {
                // Try to extract JSON from response
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsed = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('No JSON found in response');
                }
            } catch {
                this.logger.warn(`Could not parse AI response as JSON: ${response}`);
                return {
                    question,
                    sql: '',
                    explanation: 'AI nie mogło wygenerować poprawnego zapytania.',
                    results: { columns: [], rows: [], rowCount: 0, executionTime: 0 },
                    error: 'Failed to parse AI response',
                };
            }

            // Execute the generated SQL
            try {
                const results = await this.executeQuery(parsed.sql);
                return {
                    question,
                    sql: parsed.sql,
                    explanation: parsed.explanation,
                    results,
                };
            } catch (queryError) {
                return {
                    question,
                    sql: parsed.sql,
                    explanation: parsed.explanation,
                    results: { columns: [], rows: [], rowCount: 0, executionTime: 0 },
                    error: queryError.message,
                };
            }
        } catch (aiError) {
            this.logger.error(`AI error: ${aiError.message}`);
            return {
                question,
                sql: '',
                explanation: '',
                results: { columns: [], rows: [], rowCount: 0, executionTime: 0 },
                error: `AI error: ${aiError.message}`,
            };
        }
    }

    /**
     * Get quick statistics about the database
     */
    async getStats(): Promise<Record<string, any>> {
        const tables = await this.getTables();
        const totalRows = tables.reduce((sum, t) => sum + t.rowCount, 0);

        // Get some quick stats
        let campaignStats = { total: 0, byStatus: {} };
        let supplierStats = { total: 0, byCountry: {} };

        try {
            const campaigns = await this.prisma.$queryRaw(
                Prisma.sql`SELECT status, COUNT(*) as count FROM "Campaign" GROUP BY status`
            ) as any[];
            campaignStats = {
                total: campaigns.reduce((sum, c) => sum + Number(c.count), 0),
                byStatus: Object.fromEntries(campaigns.map((c) => [c.status, Number(c.count)])),
            };
        } catch { /* ignore */ }

        try {
            const suppliers = await this.prisma.$queryRaw(
                Prisma.sql`SELECT country, COUNT(*) as count FROM "Supplier" WHERE country IS NOT NULL GROUP BY country ORDER BY count DESC LIMIT 10`
            ) as any[];
            supplierStats = {
                total: suppliers.reduce((sum, s) => sum + Number(s.count), 0),
                byCountry: Object.fromEntries(suppliers.map((s) => [s.country, Number(s.count)])),
            };
        } catch { /* ignore */ }

        return {
            tables: tables.length,
            totalRows,
            tableStats: tables,
            campaigns: campaignStats,
            suppliers: supplierStats,
        };
    }
}
