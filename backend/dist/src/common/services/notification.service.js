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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const email_service_1 = require("../../email/email.service");
const sms_service_1 = require("../../auth/sms.service");
const prisma_service_1 = require("../../prisma/prisma.service");
let NotificationService = NotificationService_1 = class NotificationService {
    emailService;
    smsService;
    prisma;
    logger = new common_1.Logger(NotificationService_1.name);
    constructor(emailService, smsService, prisma) {
        this.emailService = emailService;
        this.smsService = smsService;
        this.prisma = prisma;
    }
    async send(userId, event, payload) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            this.logger.warn(`User ${userId} not found, skipping notification.`);
            return;
        }
        let preferences = [];
        try {
            preferences = user.notificationPreferences ? JSON.parse(user.notificationPreferences) : [];
        }
        catch (e) {
            this.logger.error(`Failed to parse preferences for user ${userId}`, e);
        }
        const pref = preferences.find((p) => p.event === event);
        const channels = pref?.channels || { email: true, push: false, sms: false };
        this.logger.log(`Dispatching notification '${event}' to User ${userId} via [${Object.keys(channels).filter(k => channels[k]).join(',')}]`);
        if (channels.email) {
            await this.emailService.sendNotificationEmail(user.email, payload.subject, payload.message);
        }
        if (channels.sms && user.phone && user.isPhoneVerified) {
            const smsBody = `${payload.subject}: ${payload.message}`.substring(0, 160);
            await this.smsService.sendCustomSms(user.phone, smsBody);
        }
        if (channels.push) {
            this.logger.log(`[PUSH STUB] Sending push to ${userId}: ${payload.subject}`);
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [email_service_1.EmailService,
        sms_service_1.SmsService,
        prisma_service_1.PrismaService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map