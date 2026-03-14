import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    namespace: 'sourcing',
    cors: {
        origin: process.env.NODE_ENV === 'production'
            ? [
                'https://procurea.pl',
                'https://www.procurea.pl',
                'https://app.procurea.pl',
                'https://admin.procurea.pl',
                'https://vendor.procurea.pl',
                'https://api.procurea.pl',
                // EN domains (procurea.io)
                'https://procurea.io',
                'https://www.procurea.io',
                'https://app.procurea.io',
            ]
            : true, // Allow all in development
        credentials: true,
    },
    transports: ['websocket', 'polling'],
})
export class SourcingGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('SourcingGateway');

    afterInit(server: Server) {
        this.logger.log('Sourcing WebSocket Gateway initialized');
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(client: Socket, payload: { campaignId: string }) {
        if (payload && payload.campaignId) {
            client.join(payload.campaignId);
            this.logger.log(`Client ${client.id} joined campaign room ${payload.campaignId}`);
        }
    }

    emitLog(campaignId: string, message: string) {
        this.server.to(campaignId).emit('campaign.log', { message });
    }

    emitProgress(campaignId: string, stage: string, progress: number) {
        this.server.to(campaignId).emit('campaign.progress', { stage, progress });
    }

    emitSupplierUpdate(campaignId: string, update: any) {
        this.server.to(campaignId).emit('campaign.supplier_update', update);
    }

    emitCompleted(campaignId: string, status: string = 'COMPLETED') {
        this.server.to(campaignId).emit('campaign.completed', { campaignId, status });
    }

    emitError(campaignId: string, error: string) {
        this.server.to(campaignId).emit('campaign.error', { message: error });
    }
}
