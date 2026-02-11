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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ErrorTrackingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorTrackingService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let ErrorTrackingService = ErrorTrackingService_1 = class ErrorTrackingService {
    logger = new common_1.Logger(ErrorTrackingService_1.name);
    errors = [];
    maxErrors = 100;
    logFilePath = path.join(process.cwd(), 'error-logs.json');
    constructor() {
        this.loadErrors();
    }
    recordError(error, options) {
        const errorRecord = {
            id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            type: options.type || 'UNKNOWN',
            service: options.service,
            message: typeof error === 'string' ? error : error.message,
            stack: typeof error === 'string' ? undefined : error.stack,
            context: options.context,
            screenshotPath: options.screenshotPath,
        };
        this.logger.warn(`[ERROR TRACKED] Service: ${options.service} - ${errorRecord.message}`);
        this.errors.unshift(errorRecord);
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(0, this.maxErrors);
        }
        this.saveErrors();
        return errorRecord;
    }
    getRecentErrors(limit = 20) {
        return this.errors.slice(0, limit);
    }
    getErrorById(id) {
        return this.errors.find(e => e.id === id);
    }
    getStats() {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const byService = {};
        const byType = {};
        let last24h = 0;
        for (const err of this.errors) {
            byService[err.service] = (byService[err.service] || 0) + 1;
            byType[err.type] = (byType[err.type] || 0) + 1;
            if (new Date(err.timestamp) > oneDayAgo) {
                last24h++;
            }
        }
        return {
            total: this.errors.length,
            byService,
            byType,
            last24h,
        };
    }
    updateErrorAnalysis(errorId, analysis) {
        const error = this.getErrorById(errorId);
        if (error) {
            error.analysis = analysis;
            this.saveErrors();
            return true;
        }
        return false;
    }
    clearErrors() {
        this.errors = [];
        this.saveErrors();
    }
    loadErrors() {
        try {
            if (fs.existsSync(this.logFilePath)) {
                const data = fs.readFileSync(this.logFilePath, 'utf-8');
                this.errors = JSON.parse(data);
                this.logger.log(`Loaded ${this.errors.length} error records from disk`);
            }
        }
        catch (e) {
            this.logger.warn(`Could not load error logs: ${e.message}`);
            this.errors = [];
        }
    }
    saveErrors() {
        try {
            fs.writeFileSync(this.logFilePath, JSON.stringify(this.errors, null, 2));
        }
        catch (e) {
            this.logger.error(`Could not save error logs: ${e.message}`);
        }
    }
};
exports.ErrorTrackingService = ErrorTrackingService;
exports.ErrorTrackingService = ErrorTrackingService = ErrorTrackingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ErrorTrackingService);
//# sourceMappingURL=error-tracking.service.js.map