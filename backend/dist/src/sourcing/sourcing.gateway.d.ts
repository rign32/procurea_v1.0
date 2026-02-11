import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class SourcingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private logger;
    afterInit(server: Server): void;
    handleConnection(client: Socket, ...args: any[]): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(client: Socket, payload: {
        campaignId: string;
    }): void;
    emitLog(campaignId: string, message: string): void;
    emitProgress(campaignId: string, stage: string, progress: number): void;
    emitSupplierUpdate(campaignId: string, update: any): void;
}
