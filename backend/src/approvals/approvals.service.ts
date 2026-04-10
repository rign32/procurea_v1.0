import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class ApprovalsService {
    private readonly logger = new Logger(ApprovalsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService,
    ) {}

    async findPending(userId: string, status?: string) {
        const where: any = { approverId: userId };
        if (status) {
            where.status = status;
        }
        return this.prisma.approvalRequest.findMany({
            where,
            include: {
                requester: { select: { id: true, name: true, email: true } },
                approver: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(requesterId: string, data: {
        entityType: string;
        entityId: string;
        approverId: string;
        reason?: string;
    }) {
        const approval = await this.prisma.approvalRequest.create({
            data: {
                requesterId,
                approverId: data.approverId,
                entityType: data.entityType,
                entityId: data.entityId,
                reason: data.reason,
                status: 'PENDING',
            },
            include: {
                requester: { select: { name: true, email: true } },
                approver: { select: { name: true, email: true } },
            },
        });

        // Notify approver via email
        if (approval.approver?.email) {
            const requesterName = approval.requester?.name || approval.requester?.email || 'A team member';
            await this.emailService.sendNotificationEmail(
                approval.approver.email,
                `Approval requested: ${data.entityType}`,
                `${requesterName} has requested your approval for a ${data.entityType}. ${data.reason ? `Reason: ${data.reason}` : ''}`,
            ).catch(err => this.logger.warn(`Failed to send approval email: ${err.message}`));
        }

        return approval;
    }

    async approve(id: string, userId: string, comments?: string) {
        const approval = await this.prisma.approvalRequest.findUnique({ where: { id } });
        if (!approval) throw new NotFoundException('Approval request not found');
        if (approval.approverId !== userId) throw new ForbiddenException('Not your approval to process');
        if (approval.status !== 'PENDING') throw new ForbiddenException('Already processed');

        return this.prisma.approvalRequest.update({
            where: { id },
            data: {
                status: 'APPROVED',
                resolvedAt: new Date(),
                comments,
            },
        });
    }

    async reject(id: string, userId: string, reason?: string) {
        const approval = await this.prisma.approvalRequest.findUnique({ where: { id } });
        if (!approval) throw new NotFoundException('Approval request not found');
        if (approval.approverId !== userId) throw new ForbiddenException('Not your approval to process');
        if (approval.status !== 'PENDING') throw new ForbiddenException('Already processed');

        return this.prisma.approvalRequest.update({
            where: { id },
            data: {
                status: 'REJECTED',
                resolvedAt: new Date(),
                comments: reason,
            },
        });
    }
}
