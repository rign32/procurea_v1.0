import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WorkspacesService } from './workspaces.service';

@Controller('workspaces')
@UseGuards(AuthGuard('jwt'))
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  /** GET /workspaces — list workspaces for user's org */
  @Get()
  async list(@Req() req: any) {
    const userId = req.user?.userId || req.user?.sub;
    return this.workspacesService.listForUser(userId);
  }

  /** POST /workspaces — create workspace (org admin only) */
  @Post()
  async create(
    @Req() req: any,
    @Body() body: { name: string; description?: string },
  ) {
    const userId = req.user?.userId || req.user?.sub;
    return this.workspacesService.create(userId, body);
  }

  /** PATCH /workspaces/:id — update workspace name/description */
  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string },
  ) {
    const userId = req.user?.userId || req.user?.sub;
    return this.workspacesService.update(userId, id, body);
  }

  /** DELETE /workspaces/:id — delete workspace (org admin only) */
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.userId || req.user?.sub;
    return this.workspacesService.remove(userId, id);
  }

  /** POST /workspaces/:id/members — add member */
  @Post(':id/members')
  async addMember(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { userId: string; role?: string },
  ) {
    const requestingUserId = req.user?.userId || req.user?.sub;
    return this.workspacesService.addMember(requestingUserId, id, body);
  }

  /** DELETE /workspaces/:id/members/:userId — remove member */
  @Delete(':id/members/:userId')
  async removeMember(
    @Req() req: any,
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
  ) {
    const requestingUserId = req.user?.userId || req.user?.sub;
    return this.workspacesService.removeMember(
      requestingUserId,
      id,
      targetUserId,
    );
  }
}
