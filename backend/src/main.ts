import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

// Initialize Sentry before the application is created
Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  integrations: [
    nodeProfilingIntegration(),
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

async function bootstrap() {
  if (process.env.PROCESS_TYPE === 'worker') {
    // Worker Mode (Microservice / Cloud Run Job)
    const app = await NestFactory.createApplicationContext(AppModule);
    console.log('👷 AI Worker started successfully');
    // Keep alive logic would go here (e.g. queue listener)
  } else {
    // API Mode (HTTP Server)
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.use(cookieParser());

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
          'https://staging.procurea.pl',
          'https://procurea-app-staging.web.app',
          'https://procurea-frontend.web.app',
          'https://procurea-admin.web.app',
          'https://procurea-vendor.web.app'
        ]
        : true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    // Swagger / OpenAPI Setup
    const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger');
    const config = new DocumentBuilder()
      .setTitle('Procurea API')
      .setDescription('The Procurea SaaS API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // Serve static files from public directory
    app.useStaticAssets(join(__dirname, '..', 'public'));

    await app.listen(process.env.PORT ?? 3010, '0.0.0.0');
    console.log(`🚀 HTTP Server running on port ${process.env.PORT ?? 3010}`);
    console.log(`📚 Swagger Docs: http://localhost:${process.env.PORT ?? 3010}/api/docs`);
    console.log(`📊 DB Explorer: http://localhost:${process.env.PORT ?? 3010}/db-explorer.html`);
  }
}
bootstrap();

