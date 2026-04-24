import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class SearchCriteriaDto {
    @IsString()
    region: string;

    @IsOptional()
    @IsString()
    industry?: string;

    @IsOptional()
    @IsString()
    sourcingMode?: string;

    @IsOptional()
    @IsString()
    brief?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    eventDate?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    headcount?: number;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    material?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    eau?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    quantity?: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    keywords?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    targetCountries?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    excludedCountries?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    requiredCertificates?: string[];

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    deliveryLocationId?: string;

    @IsOptional()
    @IsNumber()
    targetPrice?: number;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsOptional()
    @IsString()
    incoterms?: string;

    @IsOptional()
    @IsString()
    paymentTerms?: string;

    @IsOptional()
    @IsString()
    desiredDeliveryDate?: string;

    // MOQ expectation — used by strategy/screener to filter suppliers whose MOQ won't match
    @IsOptional()
    @IsNumber()
    @Min(1)
    moq?: number;

    // Expected supplier lead time (weeks) — buyer's acceptable window
    @IsOptional()
    @IsNumber()
    @Min(1)
    leadTimeWeeks?: number;

    // Retail-specific: preference nearshore vs offshore (China / mixed)
    @IsOptional()
    @IsString()
    sourcingGeography?: string;

    // Construction PL: specific voivodeships to tighten locality from "whole country" to the site region
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    voivodeships?: string[];

    @IsOptional()
    @IsString()
    offerDeadline?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    supplierTypes?: string[];
}

export class CreateCampaignDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    language?: string;

    @IsOptional()
    @IsString()
    sequenceTemplateId?: string;

    @ValidateNested()
    @Type(() => SearchCriteriaDto)
    searchCriteria: SearchCriteriaDto;
}
