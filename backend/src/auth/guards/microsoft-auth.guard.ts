import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class MicrosoftAuthGuard extends AuthGuard('microsoft') {
    getAuthenticateOptions(context: ExecutionContext) {
        // authMode is now passed via cookie, not OAuth state (serverless has no session support)
        return {
            ...super.getAuthenticateOptions(context),
            session: false
        };
    }
}
