import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private configService: ConfigService) {
        const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'https://api.procurea.pl/auth/google/callback';
        console.log('[GoogleStrategy] Initializing with callbackURL:', callbackURL);
        console.log('[GoogleStrategy] Client ID present:', !!process.env.GOOGLE_CLIENT_ID);

        super({
            clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder_client_id',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder_secret',
            callbackURL,
            scope: ['email', 'profile'],
            state: false, // Disabled for serverless (session not available)
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const { id, name, emails, photos } = profile;

        const user = {
            provider: 'google',
            providerId: id,
            email: emails[0].value,
            name: `${name.givenName} ${name.familyName}`,
            picture: photos[0].value,
            accessToken,
        };

        done(null, user);
    }
}
