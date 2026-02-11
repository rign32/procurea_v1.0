"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Express5Adapter = void 0;
const platform_express_1 = require("@nestjs/platform-express");
class Express5Adapter extends platform_express_1.ExpressAdapter {
    constructor(instance) {
        super(instance);
        const originalRegisterParserMiddleware = this.registerParserMiddleware;
        this.registerParserMiddleware = function (prefix, rawBody) {
            const originalIsMiddlewareApplied = this.isMiddlewareApplied;
            this.isMiddlewareApplied = () => false;
            try {
                originalRegisterParserMiddleware.call(this, prefix, rawBody);
            }
            finally {
                this.isMiddlewareApplied = originalIsMiddlewareApplied;
            }
        };
    }
}
exports.Express5Adapter = Express5Adapter;
//# sourceMappingURL=express5.adapter.js.map