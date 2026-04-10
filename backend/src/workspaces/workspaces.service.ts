import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkspacesService {
  private readonly logger = new Logger(WorkspacesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * List all workspaces for the user's organization.
   * Returns workspaces where the user is a member, plus metadata.
   */
  async listForUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, role: true },
    });

    if (!user?.organizationId) {
      return [];
    }

    const workspaces = await this.prisma.workspace.findMany({
      where: { organizationId: user.organizationId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return workspaces.map((ws) => ({
      id: ws.id,
      name: ws.name,
      description: ws.description,
      organizationId: ws.organizationId,
      memberCount: ws.members.length,
      members: ws.members.map((m) => ({
        id: m.id,
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
        createdAt: m.createdAt.toISOString(),
      })),
      isMember: ws.members.some((m) => m.userId === userId),
      myRole: ws.members.find((m) => m.userId === userId)?.role || null,
      createdAt: ws.createdAt.toISOString(),
      updatedAt: ws.updatedAt.toISOString(),
    }));
  }

  /**
   * Create a new workspace (org admin only).
   */
  async create(
    userId: string,
    data: { name: string; description?: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, role: true },
    });

    if (!user?.organizationId) {
      throw new ForbiddenException(
        'You must belong to an organization to create workspaces',
      );
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only organization admins can create workspaces',
      );
    }

    const workspace = await this.prisma.workspace.create({
      data: {
        name: data.name,
        description: data.description || null,
        organizationId: user.organizationId,
        members: {
          create: {
            userId,
            role: 'admin', // Creator is automatically workspace admin
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    this.logger.log(
      `Workspace "${workspace.name}" created by user ${userId} in org ${user.organizationId}`,
    );

    return {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      organizationId: workspace.organizationId,
      memberCount: workspace.members.length,
      members: workspace.members.map((m) => ({
        id: m.id,
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
        createdAt: m.createdAt.toISOString(),
      })),
      isMember: true,
      myRole: 'admin',
      createdAt: workspace.createdAt.toISOString(),
      updatedAt: workspace.updatedAt.toISOString(),
    };
  }

  /**
   * Update workspace name/description.
   * Only workspace admin or org admin can update.
   */
  async update(
    userId: string,
    workspaceId: string,
    data: { name?: string; description?: string },
  ) {
    await this.assertWorkspaceAdmin(userId, workspaceId);

    const workspace = await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
      },
    });

    return {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      updatedAt: workspace.updatedAt.toISOString(),
    };
  }

  /**
   * Delete a workspace.
   * Only org admin can delete.
   */
  async remove(userId: string, workspaceId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, role: true },
    });

    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.organizationId !== user?.organizationId) {
      throw new ForbiddenException('Workspace does not belong to your organization');
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only organization admins can delete workspaces',
      );
    }

    await this.prisma.workspace.delete({ where: { id: workspaceId } });

    this.logger.log(
      `Workspace "${workspace.name}" (${workspaceId}) deleted by user ${userId}`,
    );

    return { success: true };
  }

  /**
   * Add a member to workspace.
   * Only workspace admin or org admin.
   */
  async addMember(
    userId: string,
    workspaceId: string,
    data: { userId: string; role?: string },
  ) {
    await this.assertWorkspaceAdmin(userId, workspaceId);

    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { organizationId: true },
    });

    // Ensure target user belongs to the same organization
    const targetUser = await this.prisma.user.findUnique({
      where: { id: data.userId },
      select: { organizationId: true, name: true, email: true },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (targetUser.organizationId !== workspace?.organizationId) {
      throw new ForbiddenException(
        'User must belong to the same organization',
      );
    }

    // Check for existing membership
    const existing = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: data.userId },
      },
    });

    if (existing) {
      throw new ConflictException('User is already a member of this workspace');
    }

    const validRoles = ['admin', 'member', 'viewer'];
    const role = validRoles.includes(data.role || '') ? data.role! : 'member';

    const member = await this.prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: data.userId,
        role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    this.logger.log(
      `User ${data.userId} added to workspace ${workspaceId} with role ${role}`,
    );

    return {
      id: member.id,
      userId: member.userId,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
      createdAt: member.createdAt.toISOString(),
    };
  }

  /**
   * Remove a member from workspace.
   * Only workspace admin or org admin.
   */
  async removeMember(
    userId: string,
    workspaceId: string,
    targetUserId: string,
  ) {
    await this.assertWorkspaceAdmin(userId, workspaceId);

    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: targetUserId },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this workspace');
    }

    await this.prisma.workspaceMember.delete({
      where: { id: member.id },
    });

    this.logger.log(
      `User ${targetUserId} removed from workspace ${workspaceId} by user ${userId}`,
    );

    return { success: true };
  }

  // --- Helpers ---

  /**
   * Assert that the requesting user is a workspace admin or org admin.
   */
  private async assertWorkspaceAdmin(
    userId: string,
    workspaceId: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, role: true },
    });

    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { organizationId: true },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.organizationId !== user?.organizationId) {
      throw new ForbiddenException(
        'Workspace does not belong to your organization',
      );
    }

    // Org admin can always manage workspaces
    if (user.role === 'ADMIN') {
      return;
    }

    // Check workspace-level admin role
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
    });

    if (!membership || membership.role !== 'admin') {
      throw new ForbiddenException(
        'Only workspace admins or organization admins can perform this action',
      );
    }
  }
}
