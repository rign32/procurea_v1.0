import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('Authentication required');
        }

        if (user.role !== 'ADMIN') {
            throw new ForbiddenException('Admin access required');
        }

        // Check if user is blocked
        if (user.isBlocked) {
            throw new ForbiddenException('Account is blocked');
        }

        return true;
    }
}
