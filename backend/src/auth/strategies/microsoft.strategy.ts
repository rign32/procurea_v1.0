import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-microsoft';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
    constructor() {
        super({
            clientID: process.env.MICROSOFT_CLIENT_ID || 'placeholder_client_id',
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET || 'placeholder_secret',
            callbackURL: process.env.MICROSOFT_CALLBACK_URL || 'https://api.procurea.pl/auth/microsoft/callback',
            scope: ['user.read'],
            tenant: 'common',
            state: false, // Disabled for serverless (session not available)
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const { id, displayName, emails } = profile;

        const user = {
            provider: 'microsoft',
            providerId: id,
            email: emails[0].value,
            name: displayName,
            accessToken,
        };

        done(null, user);
    }
}
