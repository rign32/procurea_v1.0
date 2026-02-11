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
exports.MicrosoftStrategy = void 0;
const passport_1 = require("@nestjs/passport");
const passport_microsoft_1 = require("passport-microsoft");
const common_1 = require("@nestjs/common");
let MicrosoftStrategy = class MicrosoftStrategy extends (0, passport_1.PassportStrategy)(passport_microsoft_1.Strategy, 'microsoft') {
    constructor() {
        super({
            clientID: process.env.MICROSOFT_CLIENT_ID || 'placeholder_client_id',
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET || 'placeholder_secret',
            callbackURL: process.env.MICROSOFT_CALLBACK_URL || 'https://api.procurea.pl/auth/microsoft/callback',
            scope: ['user.read'],
            tenant: 'common',
            state: false,
        });
    }
    async validate(accessToken, refreshToken, profile, done) {
        const { id, displayName, emails } = profile;
        const user = {
            provider: 'microsoft',
            providerId: id,
            email: emails[0].value,
            name: displayName,
            accessToken,
        };
        done(null, user);
    }
};
exports.MicrosoftStrategy = MicrosoftStrategy;
exports.MicrosoftStrategy = MicrosoftStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MicrosoftStrategy);
//# sourceMappingURL=microsoft.strategy.js.map