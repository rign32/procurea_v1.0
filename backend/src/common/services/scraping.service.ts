import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class ScrapingService {
    private readonly logger = new Logger(ScrapingService.name);
    private readonly cache = new Map<string, { content: string; timestamp: number }>();
    private readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
    private readonly MAX_RETRIES = 3;
    private readonly CONTENT_LIMIT = 25000;
    private readonly JS_RENDER_MIN_CONTENT = 200; // Threshold: if static content < 200 chars, try JS rendering

    async fetchContent(url: string): Promise<string> {
        // Check cache first
        const cached = this.cache.get(url);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
            this.logger.log(`[CACHE HIT] ${url}`);
            return cached.content;
        }

        this.logger.log(`Fetching content from: ${url}`);

        // Step 1: Try static fetch (cheerio) — works for ~90% of B2B sites
        const staticContent = await this.fetchStatic(url);

        // Step 2: If static content is too short, try JS rendering
        if (
            staticContent &&
            !staticContent.startsWith('Error') &&
            staticContent.length < this.JS_RENDER_MIN_CONTENT &&
            this.isJsRenderingAvailable()
        ) {
            this.logger.log(`[JS RENDER] Static content too short (${staticContent.length} chars) for ${url} — trying JS rendering`);
            const jsContent = await this.fetchWithJsRendering(url);
            if (jsContent && !jsContent.startsWith('Error') && jsContent.length > staticContent.length) {
                this.logger.log(`[JS RENDER] Success: ${jsContent.length} chars (vs ${staticContent.length} static)`);
                this.cache.set(url, { content: jsContent, timestamp: Date.now() });
                return jsContent;
            }
        }

        // Cache and return static content (or error)
        if (staticContent && !staticContent.startsWith('Error')) {
            this.cache.set(url, { content: staticContent, timestamp: Date.now() });
        }
        return staticContent;
    }

    /**
     * Static HTML fetch via axios + cheerio.
     * Fast and cheap — the default path for most pages.
     */
    private async fetchStatic(url: string): Promise<string> {
        for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
            try {
                const { data } = await axios.get(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; ProcureaBot/1.0)',
                        'Accept': 'text/html,application/xhtml+xml',
                        'Accept-Language': 'en-US,en;q=0.9,pl;q=0.8,de;q=0.7',
                    },
                    timeout: 15000,
                    maxContentLength: 5 * 1024 * 1024,
                    maxBodyLength: 5 * 1024 * 1024,
                    maxRedirects: 3,
                });
                const $ = cheerio.load(data);

                // Remove non-content elements
                $('script, style, nav, iframe, noscript, svg').remove();
                $('[role="navigation"], [role="banner"], [aria-hidden="true"]').remove();

                // Extract meaningful text
                const text = $('body').text().replace(/\s+/g, ' ').trim();
                return text.substring(0, this.CONTENT_LIMIT);
            } catch (error) {
                const isLastAttempt = attempt === this.MAX_RETRIES;
                const delay = Math.pow(2, attempt) * 1000;

                if (isLastAttempt) {
                    this.logger.error(`Failed to fetch ${url} after ${this.MAX_RETRIES} attempts: ${error.message}`);
                    return `Error fetching content: ${error.message}`;
                }

                this.logger.warn(`Attempt ${attempt}/${this.MAX_RETRIES} failed for ${url}: ${error.message}. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        return 'Error: Unexpected retry loop exit';
    }

    /**
     * JS-rendered fetch via external API (ScrapingBee, Browserless, or similar).
     * Only called when static fetch returns insufficient content.
     */
    private async fetchWithJsRendering(url: string): Promise<string> {
        const apiKey = process.env.SCRAPING_API_KEY;
        const apiUrl = process.env.SCRAPING_API_URL || 'https://app.scrapingbee.com/api/v1/';

        if (!apiKey || !apiUrl) {
            this.logger.warn('[JS RENDER] No SCRAPING_API_KEY/URL configured — skipping JS rendering');
            return '';
        }

        try {
            const { data } = await axios.get(apiUrl, {
                params: {
                    api_key: apiKey,
                    url: url,
                    render_js: 'true',
                    premium_proxy: 'false',
                    block_ads: 'true',
                    block_resources: 'false',
                    wait: '3000',
                },
                timeout: 30000,
            });

            const $ = cheerio.load(data);
            $('script, style, nav, iframe, noscript, svg').remove();
            $('[role="navigation"], [role="banner"], [aria-hidden="true"]').remove();

            const text = $('body').text().replace(/\s+/g, ' ').trim();
            return text.substring(0, this.CONTENT_LIMIT);
        } catch (error) {
            this.logger.warn(`[JS RENDER] Failed for ${url}: ${error.message}`);
            return '';
        }
    }

    /**
     * Check if JS rendering is configured and available.
     */
    private isJsRenderingAvailable(): boolean {
        return !!(process.env.SCRAPING_API_KEY && process.env.SCRAPING_API_URL);
    }
}
