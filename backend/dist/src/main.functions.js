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
expressApp.use((req, _res, next) => {
    if (req.url.startsWith('/api/')) {
        req.url = req.url.replace(/^\/api/, '');
    }
    else if (req.url === '/api') {
        req.url = '/';
    }
    next();
});
const createNestServer = async () => {
    if (!app) {
        app = await core_1.NestFactory.create(app_module_1.AppModule, new express5_adapter_1.Express5Adapter(expressApp), { logger: ['error', 'warn', 'log'] });
        app.use((0, cookie_parser_1.default)());
        app.enableCors({
            origin: [
                'https://project-c64b9be9-1d92-4bc6-be7.web.app',
                'https://procurea.pl',
                'https://www.procurea.pl',
                'https://app.procurea.pl',
                'http://localhost:5173',
                'http://localhost:3000',
                'http://localhost:3010',
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
}, expressApp);
createNestServer().catch(err => console.error('NestJS init failed:', err));
//# sourceMappingURL=main.functions.js.map