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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourcingGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
let SourcingGateway = class SourcingGateway {
    server;
    logger = new common_1.Logger('SourcingGateway');
    afterInit(server) {
        this.logger.log('Sourcing WebSocket Gateway initialized');
    }
    handleConnection(client, ...args) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    handleJoinRoom(client, payload) {
        if (payload && payload.campaignId) {
            client.join(payload.campaignId);
            this.logger.log(`Client ${client.id} joined campaign room ${payload.campaignId}`);
        }
    }
    emitLog(campaignId, message) {
        this.server.to(campaignId).emit('campaign.log', { message });
    }
    emitProgress(campaignId, stage, progress) {
        this.server.to(campaignId).emit('campaign.progress', { stage, progress });
    }
    emitSupplierUpdate(campaignId, update) {
        this.server.to(campaignId).emit('campaign.supplier_update', update);
    }
};
exports.SourcingGateway = SourcingGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SourcingGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], SourcingGateway.prototype, "handleJoinRoom", null);
exports.SourcingGateway = SourcingGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: 'sourcing',
        cors: {
            origin: process.env.NODE_ENV === 'production'
                ? [
                    'https://procurea.pl',
                    'https://www.procurea.pl',
                    'https://app.procurea.pl',
                    'https://admin.procurea.pl',
                    'https://vendor.procurea.pl',
                    'https://api.procurea.pl',
                ]
                : true,
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    })
], SourcingGateway);
//# sourceMappingURL=sourcing.gateway.js.map