import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { AdminGuard } from '../admin.guard';
import { LeadMagnetsService, LeadMagnetEntry } from './lead-magnets.service';

@Controller('admin/lead-magnets')
export class LeadMagnetsController {
    constructor(private readonly service: LeadMagnetsService) {}

    @Get()
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    list(): LeadMagnetEntry[] {
        return this.service.list();
    }

    // Throttled: a refresh runs the full sync workflow which downloads ~70
    // PDF frames from Figma and pushes a commit. One trigger per minute is
    // plenty even if multiple admins click at once.
    @Post('sync')
    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @Throttle({ default: { ttl: 60_000, limit: 6 } })
    async sync(
        @Body() body: { slug?: string },
    ): Promise<{ ok: true; runUrl: string; slug: string | null }> {
        const result = await this.service.dispatchSync(body?.slug);
        return { ...result, slug: body?.slug ?? null };
    }
}
