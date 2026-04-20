import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common'
import { Throttle, seconds } from '@nestjs/throttler'
import { LeadsService } from './leads.service'
import { CreateLeadDto } from './dto/create-lead.dto'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  /**
   * Public endpoint — no AuthGuard. Leads come from pre-registration
   * forms on procurea.pl / procurea.io. Throttled to prevent abuse.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { ttl: seconds(60), limit: 5 } }) // 5 submissions per minute per IP
  async create(@Body() dto: CreateLeadDto, @Req() req: any) {
    if (!dto || typeof dto !== 'object') {
      throw new BadRequestException('Invalid payload')
    }

    // Minimum validation — detailed validation happens client-side too,
    // but never trust it.
    if (!dto.name || typeof dto.name !== 'string' || dto.name.trim().length < 2) {
      throw new BadRequestException('Name required (min 2 chars)')
    }
    if (!dto.email || !EMAIL_RE.test(dto.email.trim())) {
      throw new BadRequestException('Valid email required')
    }
    if (!dto.interest || typeof dto.interest !== 'string') {
      throw new BadRequestException('Interest field required')
    }

    const ip =
      req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.ip ||
      req.connection?.remoteAddress ||
      undefined
    const userAgent = req.headers?.['user-agent']

    return this.leads.createLead(dto, { ip, userAgent })
  }
}
