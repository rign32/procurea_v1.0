/**
 * Quick test script to verify SerpApi is returning data.
 * Run with: npx ts-node src/test-serpapi.ts
 */

import axios from 'axios';

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
        const response = await axios.get('https://serpapi.com/search.json', {
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

        results.forEach((r: any, i: number) => {
            console.log(`\n[${i + 1}] ${r.title}`);
            console.log(`    Link: ${r.link}`);
            console.log(`    Snippet: ${r.snippet?.substring(0, 80)}...`);
        });

        if (results.length === 0) {
            console.warn('\nWARNING: No organic results found! Check API key or quota.');
        }

    } catch (e: any) {
        console.error('Request Failed:', e.message);
        if (e.response?.data) {
            console.error('Error Details:', JSON.stringify(e.response.data));
        }
    }
}

testSerpApi();
