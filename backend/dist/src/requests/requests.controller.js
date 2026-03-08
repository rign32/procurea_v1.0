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
exports.RequestsController = void 0;
const common_1 = require("@nestjs/common");
const requests_service_1 = require("./requests.service");
let RequestsController = class RequestsController {
    requestsService;
    constructor(requestsService) {
        this.requestsService = requestsService;
    }
    getCategories() {
        return [
            { id: 'Electronics', label: 'Elektronika' },
            { id: 'Mechanical', label: 'Mechanika' },
            { id: 'Plastics', label: 'Tworzywa sztuczne' },
            { id: 'Metal', label: 'Metal / Obróbka CNC' },
            { id: 'Rubber', label: 'Guma / Uszczelki' },
            { id: 'Textiles', label: 'Tekstylia / Odzież' },
            { id: 'Packaging', label: 'Opakowania' },
            { id: 'Chemicals', label: 'Chemia / Surowce' },
            { id: 'Automotive', label: 'Motoryzacja' },
            { id: 'Medical', label: 'Medycyna' },
            { id: 'Other', label: 'Inne' },
        ];
    }
    findAll() {
        return this.requestsService.findAll();
    }
    findOne(id) {
        return this.requestsService.findOne(id);
    }
    create(body) {
        return this.requestsService.create(body);
    }
    update(id, body) {
        return this.requestsService.update(id, body);
    }
    sendToCampaign(id, body) {
        return this.requestsService.sendRfqToCampaign(id, body.campaignId);
    }
    sendToSuppliers(id, body) {
        return this.requestsService.sendRfqToSuppliers(id, body.supplierIds);
    }
    getOffers(id) {
        return this.requestsService.getOffersByRfq(id);
    }
    createOffer(body) {
        return this.requestsService.createOffer(body);
    }
    compareOffers(body) {
        return this.requestsService.compareOffers(body.offerIds);
    }
    acceptOffer(offerId) {
        return this.requestsService.acceptOffer(offerId);
    }
    rejectOffer(offerId, body) {
        return this.requestsService.rejectOffer(offerId, body.reason);
    }
    shortlistOffer(offerId) {
        return this.requestsService.shortlistOffer(offerId);
    }
};
exports.RequestsController = RequestsController;
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/send-to-campaign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "sendToCampaign", null);
__decorate([
    (0, common_1.Post)(':id/send'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "sendToSuppliers", null);
__decorate([
    (0, common_1.Get)(':id/offers'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "getOffers", null);
__decorate([
    (0, common_1.Post)('offers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "createOffer", null);
__decorate([
    (0, common_1.Post)('offers/compare'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "compareOffers", null);
__decorate([
    (0, common_1.Post)('offers/:offerId/accept'),
    __param(0, (0, common_1.Param)('offerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "acceptOffer", null);
__decorate([
    (0, common_1.Post)('offers/:offerId/reject'),
    __param(0, (0, common_1.Param)('offerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "rejectOffer", null);
__decorate([
    (0, common_1.Post)('offers/:offerId/shortlist'),
    __param(0, (0, common_1.Param)('offerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "shortlistOffer", null);
exports.RequestsController = RequestsController = __decorate([
    (0, common_1.Controller)('requests'),
    __metadata("design:paramtypes", [requests_service_1.RequestsService])
], RequestsController);
//# sourceMappingURL=requests.controller.js.map