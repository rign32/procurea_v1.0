
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { HealthService } from '../src/common/services/health.service';
import { ApiUsageService } from '../src/common/services/api-usage.service';

async function verifyHealthCost() {
    console.log('Starting Health Cost Verification...');

    const app = await NestFactory.createApplicationContext(AppModule);
    const healthService = app.get(HealthService);
    const apiUsageService = app.get(ApiUsageService);

    // 1. Get initial usage count
    const initialStats = await apiUsageService.getUsageStats();
    console.log(`Initial Total Calls: ${initialStats.totalCalls}`);
    console.log(`Initial Total Cost: $${initialStats.totalCost}`);

    // 2. Perform Deep Health Check
    console.log('Running Deep Health Check (Optimized)...');
    const healthResult = await healthService.getSystemHealth('deep');
    console.log('Health Result:', JSON.stringify(healthResult.services.gemini, null, 2));

    // 3. Get final usage count
    const finalStats = await apiUsageService.getUsageStats();
    console.log(`Final Total Calls: ${finalStats.totalCalls}`);
    console.log(`Final Total Cost: $${finalStats.totalCost}`);

    // 4. Assertions
    if (finalStats.totalCalls === initialStats.totalCalls) {
        console.log('✅ SUCCESS: No new API calls logged during health check.');
    } else {
        console.log('❌ FAILURE: API calls were logged!');
        console.log(`Diff: ${finalStats.totalCalls - initialStats.totalCalls} calls`);
    }

    await app.close();
}

verifyHealthCost().catch(console.error);
