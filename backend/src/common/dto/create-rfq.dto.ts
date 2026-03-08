import { IsString, IsOptional, IsNumber, Min, IsDateString } from 'class-validator';

export class CreateRfqDto {
    @IsString()
    productName: string;

    @IsNumber()
    @Min(1)
    quantity: number;

    @IsOptional()
    @IsString()
    unit?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    material?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    targetPrice?: number;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    eau?: number;

    @IsOptional()
    @IsString()
    partNumber?: string;

    @IsOptional()
    @IsString()
    incoterms?: string;

    @IsOptional()
    @IsString()
    desiredDeliveryDate?: string;

    @IsOptional()
    @IsString()
    deliveryLocationId?: string;

    @IsOptional()
    @IsString()
    attachments?: string;
}
