import { IsString, IsNotEmpty } from 'class-validator';

export class CreateBannerTargetDescriptionDto{
    @IsString()
    @IsNotEmpty()
    target_description: string;

    @IsString()
    @IsNotEmpty()
    url: string;
}