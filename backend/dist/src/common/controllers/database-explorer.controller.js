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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseExplorerController = void 0;
const common_1 = require("@nestjs/common");
const database_explorer_service_1 = require("../services/database-explorer.service");
let DatabaseExplorerController = class DatabaseExplorerController {
    dbExplorer;
    constructor(dbExplorer) {
        this.dbExplorer = dbExplorer;
    }
    async getSchema() {
        return this.dbExplorer.getSchema();
    }
    async getTables() {
        return this.dbExplorer.getTables();
    }
    async getTableData(name, limit, offset) {
        const limitNum = limit ? parseInt(limit, 10) : 50;
        const offsetNum = offset ? parseInt(offset, 10) : 0;
        return this.dbExplorer.getTableData(name, limitNum, offsetNum);
    }
    async getStats() {
        return this.dbExplorer.getStats();
    }
    async executeQuery(body) {
        if (!body.sql) {
            throw new common_1.BadRequestException('SQL query is required');
        }
        return this.dbExplorer.executeQuery(body.sql);
    }
    async askQuestion(body) {
        if (!body.question) {
            throw new common_1.BadRequestException('Question is required');
        }
        return this.dbExplorer.askQuestion(body.question);
    }
};
exports.DatabaseExplorerController = DatabaseExplorerController;
__decorate([
    (0, common_1.Get)('schema'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DatabaseExplorerController.prototype, "getSchema", null);
__decorate([
    (0, common_1.Get)('tables'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DatabaseExplorerController.prototype, "getTables", null);
__decorate([
    (0, common_1.Get)('tables/:name'),
    __param(0, (0, common_1.Param)('name')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DatabaseExplorerController.prototype, "getTableData", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DatabaseExplorerController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)('query'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DatabaseExplorerController.prototype, "executeQuery", null);
__decorate([
    (0, common_1.Post)('ask'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DatabaseExplorerController.prototype, "askQuestion", null);
exports.DatabaseExplorerController = DatabaseExplorerController = __decorate([
    (0, common_1.Controller)('api/db'),
    __metadata("design:paramtypes", [database_explorer_service_1.DatabaseExplorerService])
], DatabaseExplorerController);
//# sourceMappingURL=database-explorer.controller.js.map