import { IsString, IsIn } from 'class-validator';

const VALID_STATUSES = ['DRAFT', 'SUBMITTED', 'CONFIRMED', 'DELIVERED', 'INVOICED', 'CANCELLED'] as const;

export class UpdatePoStatusDto {
    @IsString()
    @IsIn(VALID_STATUSES)
    status: string;
}
