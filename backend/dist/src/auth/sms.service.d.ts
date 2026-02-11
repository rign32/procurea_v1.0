import { ConfigService } from '@nestjs/config';
export declare class SmsService {
    private configService;
    private twilioClient;
    private readonly logger;
    private readonly verifyServiceSid;
    private formatPhoneNumber;
    constructor(configService: ConfigService);
    sendOtpCode(phoneNumber: string): Promise<string | null>;
    verifyOtpCode(phoneNumber: string, code: string): Promise<boolean>;
    sendCustomSms(phoneNumber: string, message: string): Promise<boolean>;
}
