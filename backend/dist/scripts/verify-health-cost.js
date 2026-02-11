"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const health_service_1 = require("../src/common/services/health.service");
const api_usage_service_1 = require("../src/common/services/api-usage.service");
async function verifyHealthCost() {
    console.log('Starting Health Cost Verification...');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const healthService = app.get(health_service_1.HealthService);
    const apiUsageService = app.get(api_usage_service_1.ApiUsageService);
    const initialStats = await apiUsageService.getUsageStats();
    console.log(`Initial Total Calls: ${initialStats.totalCalls}`);
    console.log(`Initial Total Cost: $${initialStats.totalCost}`);
    console.log('Running Deep Health Check (Optimized)...');
    const healthResult = await healthService.getSystemHealth('deep');
    console.log('Health Result:', JSON.stringify(healthResult.services.gemini, null, 2));
    const finalStats = await apiUsageService.getUsageStats();
    console.log(`Final Total Calls: ${finalStats.totalCalls}`);
    console.log(`Final Total Cost: $${finalStats.totalCost}`);
    if (finalStats.totalCalls === initialStats.totalCalls) {
        console.log('✅ SUCCESS: No new API calls logged during health check.');
    }
    else {
        console.log('❌ FAILURE: API calls were logged!');
        console.log(`Diff: ${finalStats.totalCalls - initialStats.totalCalls} calls`);
    }
    await app.close();
}
verifyHealthCost().catch(console.error);
//# sourceMappingURL=verify-health-cost.js.map