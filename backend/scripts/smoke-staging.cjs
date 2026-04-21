#!/usr/bin/env node
/**
 * Post-deploy smoke test for staging/production.
 *
 * Uruchamiane po każdym deploy przez GitHub Actions. Wyłapuje:
 * - cold-start 500 (retry 3x)
 * - błędy w health/db-schema (drift migracji)
 * - brak auth guard (401 → 200 = regresja bezpieczeństwa)
 * - brak rate-limit
 * - zepsute CORS (malicious origin dostaje allow)
 *
 * Usage:
 *   BASE_URL=https://procurea-app-staging.web.app node scripts/smoke-staging.cjs
 *   BASE_URL=https://app.procurea.pl node scripts/smoke-staging.cjs
 *
 * Exit code 0 = wszystkie krytyczne testy pass, 1 = fail.
 */

'use strict';

const https = require('https');
const { URL } = require('url');

const BASE_URL = process.env.BASE_URL || 'https://procurea-app-staging.web.app';
const TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;

let failed = 0;
let passed = 0;
const warnings = [];

function request(path, { method = 'GET', headers = {}, followRedirects = false } = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const req = https.request({
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname + url.search,
            method,
            headers: { 'User-Agent': 'procurea-smoke-test/1.0', ...headers },
            timeout: TIMEOUT_MS,
        }, (res) => {
            let body = '';
            res.on('data', (c) => { body += c; });
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
        });
        req.on('timeout', () => { req.destroy(new Error('timeout')); });
        req.on('error', reject);
        req.end();
    });
}

async function withRetry(label, fn, retries = MAX_RETRIES) {
    let lastErr;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await fn();
            if (attempt > 1) warnings.push(`${label}: succeeded on retry #${attempt} (cold-start?)`);
            return res;
        } catch (e) {
            lastErr = e;
            if (attempt < retries) {
                await new Promise((r) => setTimeout(r, 2000 * attempt));
            }
        }
    }
    throw lastErr;
}

function assert(cond, label, detail = '') {
    if (cond) {
        console.log(`  ✓ ${label}`);
        passed++;
    } else {
        console.log(`  ✗ ${label}${detail ? ' — ' + detail : ''}`);
        failed++;
    }
}

async function testLiveness() {
    console.log('\n[1] Liveness (cold-start tolerant, retry 3x)');
    const res = await withRetry('ping', async () => {
        const r = await request('/api/health/ping');
        if (r.status !== 200) throw new Error(`status=${r.status}`);
        return r;
    });
    assert(res.status === 200, 'GET /api/health/ping → 200');
    let parsed;
    try { parsed = JSON.parse(res.body); } catch { parsed = null; }
    assert(parsed && parsed.status === 'ok', 'ping body has status:ok');
    assert(!!parsed?.timestamp, 'ping returns timestamp');
}

async function testSystemHealth() {
    console.log('\n[2] System health');
    const res = await withRetry('health', async () => {
        const r = await request('/api/health');
        if (r.status >= 500) throw new Error(`status=${r.status}`);
        return r;
    });
    assert(res.status === 200, 'GET /api/health → 200');
    let parsed;
    try { parsed = JSON.parse(res.body); } catch { parsed = null; }
    assert(parsed?.status === 'healthy' || parsed?.status === 'degraded',
        'overall status healthy|degraded',
        parsed?.status || 'no status');
    if (parsed?.status === 'degraded') warnings.push(`health degraded: ${JSON.stringify(parsed.services || {})}`);
    assert(parsed?.services?.database?.status === 'healthy', 'database healthy');
    assert(parsed?.services?.gemini?.status === 'healthy', 'gemini healthy');
    assert(parsed?.services?.serper?.status === 'healthy', 'serper healthy');
}

async function testDbSchema() {
    console.log('\n[3] Database schema drift');
    const res = await request('/api/health/db-schema');
    assert(res.status === 200, 'GET /api/health/db-schema → 200');
    let parsed;
    try { parsed = JSON.parse(res.body); } catch { parsed = null; }
    assert(parsed?.status === 'ok', 'no migration drift', `pending=${parsed?.pendingMigrations ?? '?'}`);
    assert((parsed?.tableCount ?? 0) > 10, `tables exist (count=${parsed?.tableCount})`);
}

async function testVersion() {
    console.log('\n[4] Version info');
    const res = await request('/api/health/version');
    assert(res.status === 200, 'GET /api/health/version → 200');
    let parsed;
    try { parsed = JSON.parse(res.body); } catch { parsed = null; }
    assert(!!parsed?.version, `version present (${parsed?.version || '?'})`);
    assert(!!parsed?.nodeVersion, `nodeVersion present (${parsed?.nodeVersion || '?'})`);
}

async function testAuthGuard() {
    console.log('\n[5] Auth guard (anon requests must be 401)');
    const meRes = await request('/api/auth/me');
    assert(meRes.status === 401, 'GET /api/auth/me (no cookie) → 401', `got ${meRes.status}`);
    const campaignsRes = await request('/api/campaigns');
    assert(campaignsRes.status === 401, 'GET /api/campaigns (no cookie) → 401', `got ${campaignsRes.status}`);
}

async function testCors() {
    console.log('\n[6] CORS strict origin policy');
    const evilRes = await request('/api/auth/me', {
        method: 'OPTIONS',
        headers: {
            Origin: 'https://evil.example.com',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'content-type',
        },
    });
    const evilOrigin = evilRes.headers['access-control-allow-origin'];
    assert(!evilOrigin || evilOrigin !== 'https://evil.example.com',
        'evil origin does NOT get Access-Control-Allow-Origin',
        `got: ${evilOrigin}`);

    const url = new URL(BASE_URL);
    const goodRes = await request('/api/auth/me', {
        method: 'OPTIONS',
        headers: {
            Origin: `${url.protocol}//${url.host}`,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'content-type',
        },
    });
    assert(goodRes.headers['access-control-allow-origin'] === `${url.protocol}//${url.host}`,
        'official origin gets ACAO echoed back');
}

async function testSecurityHeaders() {
    console.log('\n[7] Security headers');
    const res = await request(`/api/health/ping?cb=${Date.now()}`);
    const h = res.headers;
    assert(/max-age=\d+/.test(h['strict-transport-security'] || ''), 'HSTS present');
    assert(h['x-content-type-options'] === 'nosniff', 'X-Content-Type-Options: nosniff');
    assert(h['x-frame-options'] === 'DENY' || h['x-frame-options'] === 'SAMEORIGIN', 'X-Frame-Options set');
    if (!h['content-security-policy']) warnings.push('CSP header missing — consider adding for XSS defense');
    if (!h['referrer-policy']) warnings.push('Referrer-Policy missing');
}

async function testRateLimit() {
    console.log('\n[8] Rate limiting (60 req/min default)');
    const results = { ok: 0, limited: 0, err: 0 };
    const promises = [];
    for (let i = 0; i < 70; i++) {
        promises.push(request(`/api/health/ping?rl=${i}`)
            .then((r) => {
                if (r.status === 200) results.ok++;
                else if (r.status === 429) results.limited++;
                else results.err++;
            })
            .catch(() => { results.err++; }));
    }
    await Promise.all(promises);
    console.log(`    200=${results.ok}  429=${results.limited}  other=${results.err}`);
    assert(results.limited > 0, 'rate limit fires under burst load');
    assert(results.err === 0, 'no 5xx errors under burst');
}

async function testNotFound() {
    console.log('\n[9] 404 for unknown routes');
    const res = await request('/api/this-endpoint-does-not-exist');
    assert(res.status === 404, 'unknown /api/* → 404', `got ${res.status}`);
}

async function main() {
    console.log(`\n🔍 Procurea smoke test — ${BASE_URL}\n${'='.repeat(60)}`);
    const started = Date.now();
    try {
        await testLiveness();
        await testSystemHealth();
        await testDbSchema();
        await testVersion();
        await testAuthGuard();
        await testCors();
        await testSecurityHeaders();
        await testRateLimit();
        await testNotFound();
    } catch (e) {
        console.error(`\n💥 Smoke test crashed: ${e.message}`);
        failed++;
    }
    const elapsed = ((Date.now() - started) / 1000).toFixed(1);
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Result: ${passed} passed, ${failed} failed  (${elapsed}s)`);
    if (warnings.length > 0) {
        console.log('\nWarnings (non-blocking):');
        for (const w of warnings) console.log(`  • ${w}`);
    }
    process.exit(failed > 0 ? 1 : 0);
}

main();
