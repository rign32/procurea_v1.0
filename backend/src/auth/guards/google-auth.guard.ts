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
        // authMode is now passed via cookie, not OAuth state (serverless has no session support)
        return {
            ...super.getAuthenticateOptions(context),
            session: false,
            prompt: 'select_account' // Force Google to show account picker every time
        };
    }
}
