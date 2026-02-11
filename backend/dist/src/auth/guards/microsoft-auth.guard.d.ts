import { ExecutionContext } from '@nestjs/common';
declare const MicrosoftAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class MicrosoftAuthGuard extends MicrosoftAuthGuard_base {
    getAuthenticateOptions(context: ExecutionContext): {
        session: boolean;
        defaultStrategy?: string | string[];
        property?: string;
    };
}
export {};
