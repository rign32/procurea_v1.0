"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ScrapingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapingService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
let ScrapingService = ScrapingService_1 = class ScrapingService {
    logger = new common_1.Logger(ScrapingService_1.name);
    cache = new Map();
    CACHE_TTL_MS = 24 * 60 * 60 * 1000;
    MAX_RETRIES = 3;
    CONTENT_LIMIT = 8000;
    async fetchContent(url) {
        const cached = this.cache.get(url);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
            this.logger.log(`[CACHE HIT] ${url}`);
            return cached.content;
        }
        this.logger.log(`Fetching content from: ${url}`);
        for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
            try {
                const { data } = await axios_1.default.get(url, {
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
                $('script, style, nav, footer, header, iframe, noscript, svg').remove();
                $('[role="navigation"], [role="banner"], [aria-hidden="true"]').remove();
                const text = $('body').text().replace(/\s+/g, ' ').trim();
                const content = text.substring(0, this.CONTENT_LIMIT);
                this.cache.set(url, { content, timestamp: Date.now() });
                return content;
            }
            catch (error) {
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
};
exports.ScrapingService = ScrapingService;
exports.ScrapingService = ScrapingService = ScrapingService_1 = __decorate([
    (0, common_1.Injectable)()
], ScrapingService);
//# sourceMappingURL=scraping.service.js.map