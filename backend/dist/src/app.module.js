"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const sourcing_module_1 = require("./sourcing/sourcing.module");
const prisma_module_1 = require("./prisma/prisma.module");
const common_module_1 = require("./common/common.module");
const auth_module_1 = require("./auth/auth.module");
const admin_module_1 = require("./admin/admin.module");
const email_module_1 = require("./email/email.module");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const requests_module_1 = require("./requests/requests.module");
const sequences_module_1 = require("./sequences/sequences.module");
const suppliers_module_1 = require("./suppliers/suppliers.module");
const organization_module_1 = require("./organization/organization.module");
const portal_module_1 = require("./portal/portal.module");
const uploads_module_1 = require("./uploads/uploads.module");
const reports_module_1 = require("./reports/reports.module");
const logger_module_1 = require("./common/logger/logger.module");
const request_id_middleware_1 = require("./common/middleware/request-id.middleware");
const auth_me_logger_middleware_1 = require("./common/middleware/auth-me-logger.middleware");
const posthog_module_1 = require("./posthog/posthog.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(request_id_middleware_1.RequestIdMiddleware)
            .forRoutes('*');
        consumer
            .apply(auth_me_logger_middleware_1.AuthMeLoggerMiddleware)
            .forRoutes('auth/me');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            schedule_1.ScheduleModule.forRoot(),
            logger_module_1.LoggerModule,
            common_module_1.CommonModule,
            sourcing_module_1.SourcingModule,
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            admin_module_1.AdminModule,
            email_module_1.EmailModule,
            requests_module_1.RequestsModule,
            sequences_module_1.SequencesModule,
            suppliers_module_1.SuppliersModule,
            organization_module_1.OrganizationModule,
            portal_module_1.PortalModule,
            uploads_module_1.UploadsModule,
            reports_module_1.ReportsModule,
            posthog_module_1.PostHogModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map