import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Twilio from 'twilio';

@Injectable()
export class SmsService {
    private twilioClient: ReturnType<typeof Twilio> | null = null;
    private readonly logger = new Logger(SmsService.name);
    private readonly verifyServiceSid: string;

    /**
     * Format phone number to E.164 format
     * Adds +48 prefix for Polish numbers if not present
     */
    private formatPhoneNumber(phone: string): string {
        // Remove all non-digit characters except +
        let cleaned = phone.replace(/[^\d+]/g, '');

        // If already has +, assume it's correctly formatted
        if (cleaned.startsWith('+')) {
            return cleaned;
        }

        // If starts with 48, add +
        if (cleaned.startsWith('48') && cleaned.length >= 11) {
            return '+' + cleaned;
        }

        // For Polish mobile numbers (9 digits starting with 5, 6, 7, 8)
        if (cleaned.length === 9 && /^[5-8]/.test(cleaned)) {
            return '+48' + cleaned;
        }

        // Default: assume Polish and add +48
        return '+48' + cleaned;
    }

    constructor(private configService: ConfigService) {
        const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
        this.verifyServiceSid = this.configService.get<string>('TWILIO_VERIFY_SERVICE_SID') || '';

        if (accountSid && authToken && this.verifyServiceSid) {
            this.twilioClient = Twilio(accountSid, authToken);
            this.logger.log('Twilio Verify client initialized');
        } else {
            this.logger.warn('Twilio credentials missing. Using MOCK SMS service.');
        }
    }

    /**
     * Send OTP code to phone number using Twilio Verify API
     * @param phoneNumber - Phone number in E.164 format (e.g., +48536067316)
     * @returns verification SID for tracking or null if mock
     */
    async sendOtpCode(phoneNumber: string): Promise<string | null> {
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
            } catch (error) {
                this.logger.error(`Failed to send OTP to ${phoneNumber}`, error);
                throw new Error('Failed to send SMS verification');
            }
        } else {
            // Mock Implementation
            const mockCode = '123456';
            this.logger.log(`[MOCK SMS] To: ${formattedPhone} | Code: ${mockCode}`);
            return null; // No verification SID in mock mode
        }
    }

    /**
     * Verify OTP code using Twilio Verify API
     * @param phoneNumber - Phone number in E.164 format
     * @param code - 6-digit OTP code
     * @returns true if verified, false otherwise
     */
    async verifyOtpCode(phoneNumber: string, code: string): Promise<boolean> {
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
            } catch (error) {
                this.logger.error(`Failed to verify OTP for ${phoneNumber}`, error);
                return false;
            }
        } else {
            // Mock Implementation - accept '123456' as valid code
            this.logger.log(`[MOCK SMS] Verifying: ${formattedPhone} with code: ${code}`);
            return code === '123456';
        }
    }

    /**
     * Send a custom text message via Twilio (regular SMS)
     * @param phoneNumber - Recipient phone number
     * @param message - Message body
     */
    async sendCustomSms(phoneNumber: string, message: string): Promise<boolean> {
        const formattedPhone = this.formatPhoneNumber(phoneNumber);

        if (this.twilioClient) {
            try {
                await this.twilioClient.messages.create({
                    body: message,
                    to: formattedPhone,
                    from: this.configService.get<string>('TWILIO_PHONE_NUMBER') || 'Procurea',
                });
                this.logger.log(`Custom SMS sent to ${formattedPhone}`);
                return true;
            } catch (error) {
                this.logger.error(`Failed to send custom SMS to ${formattedPhone}`, error);
                return false;
            }
        } else {
            this.logger.log(`[MOCK SMS] To: ${formattedPhone} | Message: ${message}`);
            return true;
        }
    }
}
