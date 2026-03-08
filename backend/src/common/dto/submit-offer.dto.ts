import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested, Min, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class PriceTierDto {
    @IsNumber()
    @Min(1)
    minQty: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    maxQty?: number;

    @IsNumber()
    @Min(0.001)
    unitPrice: number;
}

class AlternativeOfferDto {
    @IsString()
    altDescription: string;

    @IsOptional()
    @IsString()
    altMaterial?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    moq?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    leadTime?: number;

    @IsOptional()
    @IsString()
    validityDate?: string;

    @IsOptional()
    @IsString()
    comments?: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => PriceTierDto)
    priceTiers: PriceTierDto[];
}

export class SubmitOfferDto {
    @IsString()
    currency: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    moq?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    leadTime?: number;

    @IsOptional()
    @IsString()
    validityDate?: string;

    @IsOptional()
    @IsString()
    comments?: string;

    @IsOptional()
    @IsBoolean()
    specsConfirmed?: boolean;

    @IsOptional()
    @IsBoolean()
    incotermsConfirmed?: boolean;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => PriceTierDto)
    priceTiers: PriceTierDto[];

    @IsOptional()
    @ValidateNested()
    @Type(() => AlternativeOfferDto)
    alternative?: AlternativeOfferDto;

    @IsOptional()
    @IsString()
    submissionLanguage?: string;
}
