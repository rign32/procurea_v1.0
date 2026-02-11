import { ExecutionContext } from '@nestjs/common';
declare const GoogleAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class GoogleAuthGuard extends GoogleAuthGuard_base {
    constructor();
    getAuthenticateOptions(context: ExecutionContext): {
        session: boolean;
        prompt: string;
        defaultStrategy?: string | string[];
        property?: string;
    };
}
export {};
