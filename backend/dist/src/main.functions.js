"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const core_1 = require("@nestjs/core");
const express5_adapter_1 = require("./express5.adapter");
const app_module_1 = require("./app.module");
const https_1 = require("firebase-functions/v2/https");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const expressApp = (0, express_1.default)();
let app;
const createNestServer = async () => {
    if (!app) {
        app = await core_1.NestFactory.create(app_module_1.AppModule, new express5_adapter_1.Express5Adapter(expressApp), { logger: ['error', 'warn', 'log'] });
        app.use((0, cookie_parser_1.default)());
        app.enableCors({
            origin: [
                'https://procurea.pl',
                'https://www.procurea.pl',
                'https://app.procurea.pl',
                'https://admin.procurea.pl',
                'https://vendor.procurea.pl',
                'https://blog.procurea.pl',
                'https://api.procurea.pl',
                'https://procurea-app.web.app',
                'https://procurea-admin-panel.web.app',
                'https://procurea-vendor.web.app',
                'https://procurea-landing.web.app',
                'https://procurea-blog-portal.web.app',
                'http://localhost:3015',
                'http://localhost:3016',
                'http://localhost:3017'
            ],
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            credentials: true,
        });
        await app.init();
        console.log('NestJS initialized for Cloud Functions (2nd Gen)');
    }
    return app;
};
exports.api = (0, https_1.onRequest)({
    region: 'europe-west1',
    memory: '512MiB',
    timeoutSeconds: 60,
    concurrency: 80,
    minInstances: 0,
    maxInstances: 10,
    secrets: [
        'TWILIO_ACCOUNT_SID',
        'TWILIO_AUTH_TOKEN',
        'TWILIO_VERIFY_SERVICE_SID',
        'TWILIO_PHONE_NUMBER',
        'GEMINI_API_KEY',
        'SERP_API_KEY'
    ]
}, expressApp);
createNestServer().catch(err => console.error('NestJS init failed:', err));
//# sourceMappingURL=main.functions.js.map