"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const cookieOrBearerExtractor = (req) => {
    console.log('[JWT Strategy] Extracting token...');
    console.log('[JWT Strategy] Request URL:', req.url);
    console.log('[JWT Strategy] Cookies object present:', !!req.cookies);
    console.log('[JWT Strategy] Cookie names:', req.cookies ? Object.keys(req.cookies).join(', ') : 'none');
    console.log('[JWT Strategy] Has procurea_token cookie:', !!(req.cookies && req.cookies.procurea_token));
    if (req.cookies && req.cookies.procurea_token) {
        const tokenPreview = req.cookies.procurea_token.substring(0, 20) + '...';
        console.log('[JWT Strategy] ✅ Found token in cookie:', tokenPreview);
        return req.cookies.procurea_token;
    }
    const bearerToken = passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (bearerToken) {
        const tokenPreview = bearerToken.substring(0, 20) + '...';
        console.log('[JWT Strategy] ✅ Found token in Authorization header:', tokenPreview);
        return bearerToken;
    }
    console.log('[JWT Strategy] ❌ No token found in cookies or Authorization header');
    return null;
};
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    prisma;
    constructor(prisma) {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is required in environment variables. Generate one with: openssl rand -base64 64');
        }
        super({
            jwtFromRequest: cookieOrBearerExtractor,
            ignoreExpiration: false,
            secretOrKey: secret,
        });
        this.prisma = prisma;
    }
    async validate(payload) {
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
            throw new common_1.UnauthorizedException('User not found');
        }
        if (user.isBlocked) {
            console.log('[JWT Strategy] User is blocked:', payload.sub);
            throw new common_1.UnauthorizedException('User account is blocked');
        }
        console.log('[JWT Strategy] ✅ User validated:', user.email);
        return { userId: user.id, email: user.email, role: user.role };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map