import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LineItemDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @IsString()
  @MaxLength(500)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  material?: string;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetPrice?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredCerts?: string[];

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class BulkReplaceLineItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  items!: LineItemDto[];
}

// Faza 2B — per-line supplier quote
export class OfferLineItemDto {
  @IsString()
  rfqLineItemId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  moq?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  leadTime?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  altDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  altMaterial?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class BulkReplaceOfferLineItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OfferLineItemDto)
  items!: OfferLineItemDto[];
}
