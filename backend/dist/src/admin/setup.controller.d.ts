import { AdminService } from './admin.service';
export declare class SetupController {
    private readonly adminService;
    constructor(adminService: AdminService);
    setupAdmin(key: string, req: any): Promise<{
        success: boolean;
        message: string;
        info: string;
        deviceData: {
            ip: string;
            timestamp: string;
        };
    }>;
}
