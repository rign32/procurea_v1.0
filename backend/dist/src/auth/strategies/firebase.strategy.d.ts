import { Strategy } from 'passport-custom';
import { Request } from 'express';
declare const FirebaseStrategy_base: new () => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class FirebaseStrategy extends FirebaseStrategy_base {
    constructor();
    validate(req: Request): Promise<any>;
}
export {};
