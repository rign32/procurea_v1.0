import { IsString, IsNotEmpty } from 'class-validator';

export class GeneratePoDto {
    @IsString()
    @IsNotEmpty()
    contractId: string;
}
