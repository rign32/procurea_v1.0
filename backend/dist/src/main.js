"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const path_1 = require("path");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
async function bootstrap() {
    if (process.env.PROCESS_TYPE === 'worker') {
        const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
        console.log('👷 AI Worker started successfully');
    }
    else {
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.use((0, cookie_parser_1.default)());
        app.enableCors({
            origin: process.env.NODE_ENV === 'production'
                ? [
                    'https://procurea.pl',
                    'https://www.procurea.pl',
                    'https://app.procurea.pl',
                    'https://admin.procurea.pl',
                    'https://vendor.procurea.pl',
                    'https://blog.procurea.pl',
                    'https://api.procurea.pl',
                    'https://procurea-frontend.web.app',
                    'https://procurea-admin.web.app',
                    'https://procurea-vendor.web.app'
                ]
                : true,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            credentials: true,
        });
        const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger');
        const config = new DocumentBuilder()
            .setTitle('Procurea API')
            .setDescription('The Procurea SaaS API description')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/docs', app, document);
        app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'));
        await app.listen(process.env.PORT ?? 3010, '0.0.0.0');
        console.log(`🚀 HTTP Server running on port ${process.env.PORT ?? 3010}`);
        console.log(`📚 Swagger Docs: http://localhost:${process.env.PORT ?? 3010}/api/docs`);
        console.log(`📊 DB Explorer: http://localhost:${process.env.PORT ?? 3010}/db-explorer.html`);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map