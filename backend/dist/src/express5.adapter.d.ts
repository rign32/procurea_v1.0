import { ExpressAdapter } from '@nestjs/platform-express';
import type { Application } from 'express';
export declare class Express5Adapter extends ExpressAdapter {
    constructor(instance?: Application);
}
