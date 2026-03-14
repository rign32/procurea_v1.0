import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

// Custom extractor: try Authorization header first, then cookie
// Bearer header takes priority because it's an explicit client intent,
// while cookies may be sent automatically across subdomains (.procurea.pl)
const cookieOrBearerExtractor = (req: Request): string | null => {
    // 1. Try Authorization header first (admin panel, mobile apps)
    const bearerToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (bearerToken) {
        return bearerToken;
    }

    // 2. Fallback to httpOnly cookie (main app at app.procurea.pl)
    if (req.cookies && req.cookies.procurea_token) {
        return req.cookies.procurea_token;
    }

    return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService) {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error(
                'JWT_SECRET is required in environment variables. Generate one with: openssl rand -base64 64'
            );
        }

        super({
            jwtFromRequest: cookieOrBearerExtractor,
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: any) {
        // Verify user exists and is not blocked
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                role: true,
                isBlocked: true,
            },
        });

        if (!user) {
            console.log('[JWT Strategy] User not found:', payload.sub);
            throw new UnauthorizedException('User not found');
        }

        if (user.isBlocked) {
            console.log('[JWT Strategy] User is blocked:', payload.sub);
            throw new ForbiddenException('ACCOUNT_BLOCKED');
        }

        console.log('[JWT Strategy] ✅ User validated:', user.email);
        return { userId: user.id, email: user.email, role: user.role };
    }
}
