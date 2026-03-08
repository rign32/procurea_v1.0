"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./services/notification.service");
const gemini_service_1 = require("./services/gemini.service");
const google_search_service_1 = require("./services/google-search.service");
const error_tracking_service_1 = require("./services/error-tracking.service");
const health_service_1 = require("./services/health.service");
const database_explorer_service_1 = require("./services/database-explorer.service");
const api_usage_service_1 = require("./services/api-usage.service");
const health_controller_1 = require("./controllers/health.controller");
const database_explorer_controller_1 = require("./controllers/database-explorer.controller");
const admin_guard_1 = require("../admin/admin.guard");
const email_module_1 = require("../email/email.module");
const auth_module_1 = require("../auth/auth.module");
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [email_module_1.EmailModule, auth_module_1.AuthModule],
        controllers: [health_controller_1.HealthController, database_explorer_controller_1.DatabaseExplorerController],
        providers: [
            admin_guard_1.AdminGuard,
            api_usage_service_1.ApiUsageService,
            gemini_service_1.GeminiService,
            google_search_service_1.GoogleSearchService,
            error_tracking_service_1.ErrorTrackingService,
            health_service_1.HealthService,
            database_explorer_service_1.DatabaseExplorerService,
            notification_service_1.NotificationService,
        ],
        exports: [
            api_usage_service_1.ApiUsageService,
            gemini_service_1.GeminiService,
            google_search_service_1.GoogleSearchService,
            error_tracking_service_1.ErrorTrackingService,
            health_service_1.HealthService,
            database_explorer_service_1.DatabaseExplorerService,
            notification_service_1.NotificationService,
        ],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map