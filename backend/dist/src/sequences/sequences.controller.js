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
exports.SequencesController = void 0;
const common_1 = require("@nestjs/common");
const sequences_service_1 = require("./sequences.service");
let SequencesController = class SequencesController {
    sequencesService;
    constructor(sequencesService) {
        this.sequencesService = sequencesService;
    }
    findAll() {
        return this.sequencesService.findAll();
    }
    findOne(id) {
        return this.sequencesService.findOne(id);
    }
    create(name) {
        return this.sequencesService.create(name);
    }
    deleteTemplate(id) {
        return this.sequencesService.deleteTemplate(id);
    }
    cloneTemplate(id, name) {
        return this.sequencesService.cloneTemplate(id, name);
    }
    addStep(templateId, body) {
        return this.sequencesService.addStep(templateId, body);
    }
    updateStep(id, body) {
        return this.sequencesService.updateStep(id, body);
    }
    deleteStep(id) {
        return this.sequencesService.deleteStep(id);
    }
};
exports.SequencesController = SequencesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SequencesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SequencesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SequencesController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SequencesController.prototype, "deleteTemplate", null);
__decorate([
    (0, common_1.Post)(':id/clone'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SequencesController.prototype, "cloneTemplate", null);
__decorate([
    (0, common_1.Post)(':id/steps'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SequencesController.prototype, "addStep", null);
__decorate([
    (0, common_1.Patch)('steps/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SequencesController.prototype, "updateStep", null);
__decorate([
    (0, common_1.Delete)('steps/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SequencesController.prototype, "deleteStep", null);
exports.SequencesController = SequencesController = __decorate([
    (0, common_1.Controller)('sequences'),
    __metadata("design:paramtypes", [sequences_service_1.SequencesService])
], SequencesController);
//# sourceMappingURL=sequences.controller.js.map