import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateFromOfferDto {
    @IsString()
    @IsNotEmpty()
    offerId: string;
}
