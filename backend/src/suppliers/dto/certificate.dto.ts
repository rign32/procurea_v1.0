import {
  IsISO8601,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CERTIFICATE_TYPES, type CertificateType } from '../certificate-types';

export class CreateCertificateDto {
  @IsString()
  @IsIn(CERTIFICATE_TYPES as unknown as string[])
  type!: CertificateType;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  issuer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  certNumber?: string;

  @IsOptional()
  @IsISO8601()
  issuedAt?: string;

  @IsISO8601()
  validUntil!: string;

  @IsOptional()
  @IsString()
  documentId?: string;
}

export class UpdateCertificateDto {
  @IsOptional()
  @IsString()
  @IsIn(CERTIFICATE_TYPES as unknown as string[])
  type?: CertificateType;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  issuer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  certNumber?: string;

  @IsOptional()
  @IsISO8601()
  issuedAt?: string;

  @IsOptional()
  @IsISO8601()
  validUntil?: string;

  @IsOptional()
  @IsString()
  documentId?: string;
}
