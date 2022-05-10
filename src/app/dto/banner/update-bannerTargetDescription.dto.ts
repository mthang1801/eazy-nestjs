import { IsObject, IsString, IsOptional } from 'class-validator';

export class UpdateBannerTargetDescriptionDto{
    @IsString()
    @IsOptional()
    target_description: string;

    @IsString()
    @IsOptional()
    url: string;
}