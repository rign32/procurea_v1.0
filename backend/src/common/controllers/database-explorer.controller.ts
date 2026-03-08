import { Controller, Get, Post, Param, Query, Body, BadRequestException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../../admin/admin.guard';
import { DatabaseExplorerService } from '../services/database-explorer.service';

@Controller('db')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class DatabaseExplorerController {
    constructor(private readonly dbExplorer: DatabaseExplorerService) { }

    /**
     * GET /api/db/schema - Get full database schema
     */
    @Get('schema')
    async getSchema() {
        return this.dbExplorer.getSchema();
    }

    /**
     * GET /api/db/tables - Get list of tables with row counts
     */
    @Get('tables')
    async getTables() {
        return this.dbExplorer.getTables();
    }

    /**
     * GET /api/db/tables/:name - Get data from a specific table
     */
    @Get('tables/:name')
    async getTableData(
        @Param('name') name: string,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
    ) {
        const limitNum = limit ? parseInt(limit, 10) : 50;
        const offsetNum = offset ? parseInt(offset, 10) : 0;
        return this.dbExplorer.getTableData(name, limitNum, offsetNum);
    }

    /**
     * GET /api/db/stats - Get database statistics
     */
    @Get('stats')
    async getStats() {
        return this.dbExplorer.getStats();
    }

    /**
     * POST /api/db/query - Execute a SELECT query
     */
    @Post('query')
    async executeQuery(@Body() body: { sql: string }) {
        if (!body.sql) {
            throw new BadRequestException('SQL query is required');
        }
        return this.dbExplorer.executeQuery(body.sql);
    }

    /**
     * POST /api/db/ask - Ask a question in natural language
     */
    @Post('ask')
    async askQuestion(@Body() body: { question: string }) {
        if (!body.question) {
            throw new BadRequestException('Question is required');
        }
        return this.dbExplorer.askQuestion(body.question);
    }
}
