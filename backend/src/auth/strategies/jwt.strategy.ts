import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

// Custom extractor: try cookie first, then Authorization header
const cookieOrBearerExtractor = (req: Request): string | null => {
    // DIAGNOSTICS: Log token extraction process
    console.log('[JWT Strategy] Extracting token...');
    console.log('[JWT Strategy] Request URL:', req.url);
    console.log('[JWT Strategy] Cookies object present:', !!req.cookies);
    console.log('[JWT Strategy] Cookie names:', req.cookies ? Object.keys(req.cookies).join(', ') : 'none');
    console.log('[JWT Strategy] Has procurea_token cookie:', !!(req.cookies && req.cookies.procurea_token));

    // Try to get token from httpOnly cookie
    if (req.cookies && req.cookies.procurea_token) {
        const tokenPreview = req.cookies.procurea_token.substring(0, 20) + '...';
        console.log('[JWT Strategy] ✅ Found token in cookie:', tokenPreview);
        return req.cookies.procurea_token;
    }

    // Fallback to Authorization header (for backwards compatibility and mobile apps)
    const bearerToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (bearerToken) {
        const tokenPreview = bearerToken.substring(0, 20) + '...';
        console.log('[JWT Strategy] ✅ Found token in Authorization header:', tokenPreview);
        return bearerToken;
    }

    console.log('[JWT Strategy] ❌ No token found in cookies or Authorization header');
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
            throw new UnauthorizedException('User account is blocked');
        }

        console.log('[JWT Strategy] ✅ User validated:', user.email);
        return { userId: user.id, email: user.email, role: user.role };
    }
}
