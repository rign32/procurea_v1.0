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
exports.SourcingController = void 0;
const common_1 = require("@nestjs/common");
const sourcing_service_1 = require("./sourcing.service");
let SourcingController = class SourcingController {
    sourcingService;
    constructor(sourcingService) {
        this.sourcingService = sourcingService;
    }
    create(createCampaignDto) {
        return this.sourcingService.create(createCampaignDto);
    }
    findAll(status, search) {
        return this.sourcingService.findAll({ status, search });
    }
    findOne(id) {
        return this.sourcingService.findOne(id);
    }
    async getLogs(id, since) {
        return this.sourcingService.getLogs(id, since);
    }
    async exportCSV(id, res) {
        const csv = await this.sourcingService.exportCSV(id);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="campaign-${id}.csv"`);
        res.send(csv);
    }
    updateCampaign(id, body) {
        return this.sourcingService.updateCampaign(id, body);
    }
    updateStatus(id, status) {
        return this.sourcingService.updateStatus(id, status);
    }
    acceptCampaign(id, body) {
        return this.sourcingService.acceptCampaign(id, body.excludedSupplierIds || []);
    }
    deleteCampaign(id) {
        return this.sourcingService.softDelete(id);
    }
};
exports.SourcingController = SourcingController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SourcingController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SourcingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SourcingController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/logs'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('since')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SourcingController.prototype, "getLogs", null);
__decorate([
    (0, common_1.Get)(':id/export'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SourcingController.prototype, "exportCSV", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SourcingController.prototype, "updateCampaign", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SourcingController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/accept'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SourcingController.prototype, "acceptCampaign", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SourcingController.prototype, "deleteCampaign", null);
exports.SourcingController = SourcingController = __decorate([
    (0, common_1.Controller)('campaigns'),
    __metadata("design:paramtypes", [sourcing_service_1.SourcingService])
], SourcingController);
//# sourceMappingURL=sourcing.controller.js.map