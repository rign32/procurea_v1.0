import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class ScrapingService {
    private readonly logger = new Logger(ScrapingService.name);

    async fetchContent(url: string): Promise<string> {
        this.logger.log(`Fetching content from: ${url}`);
        try {
            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; ProcureaBot/1.0)',
                },
                timeout: 10000,
                maxContentLength: 5 * 1024 * 1024, // 5MB limit
                maxBodyLength: 5 * 1024 * 1024
            });
            const $ = cheerio.load(data);

            // Remove scripts, styles, etc.
            $('script').remove();
            $('style').remove();
            $('nav').remove();
            $('footer').remove();
            $('header').remove(); // Also remove header
            $('iframe').remove(); // Remove iframes

            const text = $('body').text().replace(/\s+/g, ' ').trim();
            return text.substring(0, 5000); // Limit context size
        } catch (error) {
            this.logger.error(`Failed to fetch ${url}: ${error.message}`);
            return `Error fetching content: ${error.message}`;
        }
    }
}
