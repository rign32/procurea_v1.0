"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const auth_diagnostics_controller_1 = require("./auth-diagnostics.controller");
const google_strategy_1 = require("./strategies/google.strategy");
const microsoft_strategy_1 = require("./strategies/microsoft.strategy");
const firebase_strategy_1 = require("./strategies/firebase.strategy");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const sms_service_1 = require("./sms.service");
const email_module_1 = require("../email/email.module");
const redis_service_1 = require("./redis.service");
const tokens_service_1 = require("./tokens.service");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => {
                    const secret = configService.get('JWT_SECRET');
                    if (!secret) {
                        throw new Error('JWT_SECRET is required in environment variables');
                    }
                    return {
                        secret,
                        signOptions: { expiresIn: '15m' },
                    };
                },
                inject: [config_1.ConfigService],
            }),
            config_1.ConfigModule,
            email_module_1.EmailModule,
        ],
        controllers: [auth_controller_1.AuthController, auth_diagnostics_controller_1.AuthDiagnosticsController],
        providers: [
            auth_service_1.AuthService,
            google_strategy_1.GoogleStrategy,
            microsoft_strategy_1.MicrosoftStrategy,
            jwt_strategy_1.JwtStrategy,
            firebase_strategy_1.FirebaseStrategy,
            sms_service_1.SmsService,
            redis_service_1.RedisService,
            tokens_service_1.TokensService,
        ],
        exports: [auth_service_1.AuthService, jwt_1.JwtModule, sms_service_1.SmsService, redis_service_1.RedisService, tokens_service_1.TokensService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map