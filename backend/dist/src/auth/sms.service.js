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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var SmsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const twilio_1 = __importDefault(require("twilio"));
let SmsService = SmsService_1 = class SmsService {
    configService;
    twilioClient = null;
    logger = new common_1.Logger(SmsService_1.name);
    verifyServiceSid;
    formatPhoneNumber(phone) {
        let cleaned = phone.replace(/[^\d+]/g, '');
        if (cleaned.startsWith('+')) {
            return cleaned;
        }
        if (cleaned.startsWith('48') && cleaned.length >= 11) {
            return '+' + cleaned;
        }
        if (cleaned.length === 9 && /^[5-8]/.test(cleaned)) {
            return '+48' + cleaned;
        }
        return '+48' + cleaned;
    }
    constructor(configService) {
        this.configService = configService;
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        this.verifyServiceSid = this.configService.get('TWILIO_VERIFY_SERVICE_SID') || '';
        if (accountSid && authToken && this.verifyServiceSid) {
            this.twilioClient = (0, twilio_1.default)(accountSid, authToken);
            this.logger.log('Twilio Verify client initialized');
        }
        else {
            this.logger.warn('Twilio credentials missing. Using MOCK SMS service.');
        }
    }
    async sendOtpCode(phoneNumber) {
        const formattedPhone = this.formatPhoneNumber(phoneNumber);
        this.logger.log(`[SMS] Formatting phone: ${phoneNumber} → ${formattedPhone}`);
        if (this.twilioClient) {
            try {
                const verification = await this.twilioClient.verify.v2
                    .services(this.verifyServiceSid)
                    .verifications.create({
                    to: formattedPhone,
                    channel: 'sms',
                });
                this.logger.log(`OTP sent to ${phoneNumber}, SID: ${verification.sid}`);
                return verification.sid;
            }
            catch (error) {
                this.logger.error(`Failed to send OTP to ${phoneNumber}`, error);
                throw new Error('Failed to send SMS verification');
            }
        }
        else {
            const mockCode = '123456';
            this.logger.log(`[MOCK SMS] To: ${formattedPhone} | Code: ${mockCode}`);
            return null;
        }
    }
    async verifyOtpCode(phoneNumber, code) {
        const formattedPhone = this.formatPhoneNumber(phoneNumber);
        this.logger.log(`[SMS] Verifying phone: ${phoneNumber} → ${formattedPhone}`);
        if (this.twilioClient) {
            try {
                const verificationCheck = await this.twilioClient.verify.v2
                    .services(this.verifyServiceSid)
                    .verificationChecks.create({
                    to: formattedPhone,
                    code: code,
                });
                const isApproved = verificationCheck.status === 'approved';
                this.logger.log(`OTP verification for ${phoneNumber}: ${verificationCheck.status}`);
                return isApproved;
            }
            catch (error) {
                this.logger.error(`Failed to verify OTP for ${phoneNumber}`, error);
                return false;
            }
        }
        else {
            this.logger.log(`[MOCK SMS] Verifying: ${formattedPhone} with code: ${code}`);
            return code === '123456';
        }
    }
    async sendCustomSms(phoneNumber, message) {
        const formattedPhone = this.formatPhoneNumber(phoneNumber);
        if (this.twilioClient) {
            try {
                await this.twilioClient.messages.create({
                    body: message,
                    to: formattedPhone,
                    from: this.configService.get('TWILIO_PHONE_NUMBER') || 'Procurea',
                });
                this.logger.log(`Custom SMS sent to ${formattedPhone}`);
                return true;
            }
            catch (error) {
                this.logger.error(`Failed to send custom SMS to ${formattedPhone}`, error);
                return false;
            }
        }
        else {
            this.logger.log(`[MOCK SMS] To: ${formattedPhone} | Message: ${message}`);
            return true;
        }
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = SmsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SmsService);
//# sourceMappingURL=sms.service.js.map