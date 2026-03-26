import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
    constructor() {
        super({
            accessType: 'offline',
        });
    }

    getAuthenticateOptions(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest();
        const origin = req.query?.origin || req.cookies?.procurea_auth_origin || 'app';
        return {
            ...super.getAuthenticateOptions(context),
            session: false,
            prompt: 'select_account',
            state: origin, // Pass origin through OAuth state (cookies don't survive cross-domain callback)
        };
    }
}
