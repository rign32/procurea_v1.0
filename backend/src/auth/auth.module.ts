import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthDiagnosticsController } from './auth-diagnostics.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';
import { FirebaseStrategy } from './strategies/firebase.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SmsService } from './sms.service';
import { EmailModule } from '../email/email.module';
import { SalesOpsModule } from '../sales-ops/sales-ops.module';
import { ObservabilityModule } from '../observability/observability.module';
import { RedisService } from './redis.service';
import { TokensService } from './tokens.service';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                const secret = configService.get<string>('JWT_SECRET');
                if (!secret) {
                    throw new Error('JWT_SECRET is required in environment variables');
                }
                return {
                    secret,
                    signOptions: { expiresIn: '15m' }, // Short-lived access tokens
                };
            },
            inject: [ConfigService],
        }),
        ConfigModule,
        EmailModule,
        forwardRef(() => SalesOpsModule),
        ObservabilityModule,
    ],
    controllers: [AuthController, AuthDiagnosticsController],
    providers: [
        AuthService,
        GoogleStrategy,
        MicrosoftStrategy,
        JwtStrategy,
        FirebaseStrategy,
        SmsService,
        RedisService,
        TokensService,
    ],
    exports: [AuthService, JwtModule, SmsService, RedisService, TokensService],
})
export class AuthModule { }
