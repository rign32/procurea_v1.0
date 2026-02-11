"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const SERP_API_KEY = process.env.SERP_API_KEY || 'PLACEHOLDER_KEY';
async function testSerpApi() {
    console.log('\n=== SerpApi Test ===');
    console.log(`API Key: ${SERP_API_KEY.substring(0, 10)}... (first 10 chars)`);
    if (SERP_API_KEY === 'PLACEHOLDER_KEY') {
        console.error('ERROR: SERP_API_KEY is not set! Using placeholder.');
        return;
    }
    const testQuery = 'frezowanie aluminium cnc polska producent';
    console.log(`Test Query: "${testQuery}"`);
    try {
        const response = await axios_1.default.get('https://serpapi.com/search.json', {
            params: {
                engine: 'google',
                q: testQuery,
                api_key: SERP_API_KEY,
                num: 5,
                gl: 'pl',
                hl: 'pl'
            }
        });
        console.log('\n--- Response Data ---');
        console.log('Status:', response.status);
        if (response.data.error) {
            console.error('SerpApi Error:', response.data.error);
            return;
        }
        const results = response.data.organic_results || [];
        console.log(`Organic Results Count: ${results.length}`);
        results.forEach((r, i) => {
            console.log(`\n[${i + 1}] ${r.title}`);
            console.log(`    Link: ${r.link}`);
            console.log(`    Snippet: ${r.snippet?.substring(0, 80)}...`);
        });
        if (results.length === 0) {
            console.warn('\nWARNING: No organic results found! Check API key or quota.');
        }
    }
    catch (e) {
        console.error('Request Failed:', e.message);
        if (e.response?.data) {
            console.error('Error Details:', JSON.stringify(e.response.data));
        }
    }
}
testSerpApi();
//# sourceMappingURL=test-serpapi.js.map