
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AnalystAgentService } from './sourcing/agents/analyst.agent';

async function testAnalyst() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const analyst = app.get(AnalystAgentService);

    // Mock Content simulating a difficult page (like the Shenzhen one from the screenshot)
    const mockContent = `
    <html>
      <head><title>ShenZhen KaiZhuo Electronic Technology Co., Ltd - PCB Manufacturer</title></head>
      <body>
        <h1>ShenZhen KaiZhuo Electronic Technology Co., Ltd</h1>
        <p>We are a leading manufacturer of PCB and PCBA.</p>
        <p>Our factory is located in Bao'an District, Shenzhen, China.</p>
        <p>We hold ISO9001:2015 and UL certifications.</p>
        <p>Contact us: sales@kaizhuo-pcb.com | Tel: +86-755-12345678</p>
        <footer>Copyright 2024 KaiZhuo Electronic</footer>
      </body>
    </html>
  `;

    // Real-world strategy params
    const rfq = {
        category: "Electronics",
        material: "PCB",
        region: "Global"
    };

    console.log('--- STARTING ANALYST TEST ---');
    try {
        const result = await analyst.execute(mockContent, rfq);
        console.log('RAW AGENT RESULT:');
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error(e);
    }

    await app.close();
}

testAnalyst();
