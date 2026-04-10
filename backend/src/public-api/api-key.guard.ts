import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

/**
 * Guard for public API endpoints.
 * Validates API key from `X-Api-Key` header or `Authorization: Bearer <key>`.
 * Attaches the API key record and userId to the request.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const apiKey = this.extractApiKey(request);

        if (!apiKey) {
            throw new UnauthorizedException('API key required. Use X-Api-Key header or Authorization: Bearer <key>');
        }

        const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

        const keyRecord = await this.prisma.apiKey.findUnique({
            where: { hashedKey },
            include: { user: { select: { id: true, email: true, organizationId: true } } },
        });

        if (!keyRecord) {
            throw new UnauthorizedException('Invalid API key');
        }

        if (!keyRecord.enabled) {
            throw new UnauthorizedException('API key is disabled');
        }

        if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
            throw new UnauthorizedException('API key has expired');
        }

        // Update last used
        await this.prisma.apiKey.update({
            where: { id: keyRecord.id },
            data: { lastUsedAt: new Date() },
        }).catch(() => {}); // Fire and forget

        // Attach to request
        request.apiKey = keyRecord;
        request.user = {
            userId: keyRecord.userId,
            email: keyRecord.user.email,
            organizationId: keyRecord.user.organizationId,
        };

        return true;
    }

    private extractApiKey(request: any): string | null {
        const xApiKey = request.headers['x-api-key'];
        if (xApiKey) return xApiKey;

        const authHeader = request.headers['authorization'];
        if (authHeader?.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }

        return null;
    }
}
