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
var DatabaseExplorerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseExplorerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const gemini_service_1 = require("./gemini.service");
let DatabaseExplorerService = DatabaseExplorerService_1 = class DatabaseExplorerService {
    prisma;
    geminiService;
    logger = new common_1.Logger(DatabaseExplorerService_1.name);
    schemaDefinition = [
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
    constructor(prisma, geminiService) {
        this.prisma = prisma;
        this.geminiService = geminiService;
    }
    async getSchema() {
        const tablesWithCounts = await Promise.all(this.schemaDefinition.map(async (table) => {
            let rowCount = 0;
            try {
                const result = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${table.name}"`);
                rowCount = Number(result[0]?.count || 0);
            }
            catch (e) {
                this.logger.warn(`Could not get count for ${table.name}: ${e.message}`);
            }
            return { ...table, rowCount };
        }));
        return { tables: tablesWithCounts };
    }
    async getTables() {
        const schema = await this.getSchema();
        return schema.tables.map((t) => ({
            name: t.name,
            rowCount: t.rowCount || 0,
            columnCount: t.columns.length,
        }));
    }
    async getTableData(tableName, limit = 50, offset = 0) {
        const validTable = this.schemaDefinition.find((t) => t.name.toLowerCase() === tableName.toLowerCase());
        if (!validTable) {
            throw new Error(`Table "${tableName}" not found`);
        }
        const safeLimit = Math.min(limit, 100);
        const sql = `SELECT * FROM "${validTable.name}" LIMIT ${safeLimit} OFFSET ${offset}`;
        return this.executeQuery(sql);
    }
    async executeQuery(sql) {
        const normalizedSql = sql.trim().toUpperCase();
        if (!normalizedSql.startsWith('SELECT')) {
            throw new Error('Only SELECT queries are allowed for security reasons');
        }
        const dangerousKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'CREATE', 'GRANT', 'REVOKE'];
        for (const keyword of dangerousKeywords) {
            if (normalizedSql.includes(keyword)) {
                throw new Error(`Query contains forbidden keyword: ${keyword}`);
            }
        }
        const startTime = Date.now();
        try {
            const results = await this.prisma.$queryRawUnsafe(sql);
            const executionTime = Date.now() - startTime;
            const columns = results.length > 0 ? Object.keys(results[0]) : [];
            return {
                columns,
                rows: results,
                rowCount: results.length,
                executionTime,
            };
        }
        catch (error) {
            this.logger.error(`Query failed: ${error.message}`);
            throw new Error(`Query execution failed: ${error.message}`);
        }
    }
    async askQuestion(question) {
        this.logger.log(`Processing question: ${question}`);
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
            let parsed;
            try {
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsed = JSON.parse(jsonMatch[0]);
                }
                else {
                    throw new Error('No JSON found in response');
                }
            }
            catch {
                this.logger.warn(`Could not parse AI response as JSON: ${response}`);
                return {
                    question,
                    sql: '',
                    explanation: 'AI nie mogło wygenerować poprawnego zapytania.',
                    results: { columns: [], rows: [], rowCount: 0, executionTime: 0 },
                    error: 'Failed to parse AI response',
                };
            }
            try {
                const results = await this.executeQuery(parsed.sql);
                return {
                    question,
                    sql: parsed.sql,
                    explanation: parsed.explanation,
                    results,
                };
            }
            catch (queryError) {
                return {
                    question,
                    sql: parsed.sql,
                    explanation: parsed.explanation,
                    results: { columns: [], rows: [], rowCount: 0, executionTime: 0 },
                    error: queryError.message,
                };
            }
        }
        catch (aiError) {
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
    async getStats() {
        const tables = await this.getTables();
        const totalRows = tables.reduce((sum, t) => sum + t.rowCount, 0);
        let campaignStats = { total: 0, byStatus: {} };
        let supplierStats = { total: 0, byCountry: {} };
        try {
            const campaigns = await this.prisma.$queryRawUnsafe(`SELECT status, COUNT(*) as count FROM "Campaign" GROUP BY status`);
            campaignStats = {
                total: campaigns.reduce((sum, c) => sum + Number(c.count), 0),
                byStatus: Object.fromEntries(campaigns.map((c) => [c.status, Number(c.count)])),
            };
        }
        catch { }
        try {
            const suppliers = await this.prisma.$queryRawUnsafe(`SELECT country, COUNT(*) as count FROM "Supplier" WHERE country IS NOT NULL GROUP BY country ORDER BY count DESC LIMIT 10`);
            supplierStats = {
                total: suppliers.reduce((sum, s) => sum + Number(s.count), 0),
                byCountry: Object.fromEntries(suppliers.map((s) => [s.country, Number(s.count)])),
            };
        }
        catch { }
        return {
            tables: tables.length,
            totalRows,
            tableStats: tables,
            campaigns: campaignStats,
            suppliers: supplierStats,
        };
    }
};
exports.DatabaseExplorerService = DatabaseExplorerService;
exports.DatabaseExplorerService = DatabaseExplorerService = DatabaseExplorerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        gemini_service_1.GeminiService])
], DatabaseExplorerService);
//# sourceMappingURL=database-explorer.service.js.map