import { IsNumber, IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateCategoryFeatureDto{
    @IsNotEmpty()
    @IsNumber()
    category_id: number;

    @IsOptional()
    @IsNumber()
    feature_id: number;

    @IsNumber()
    @IsOptional()
    position: number;

    @IsString()
    @IsOptional()
    status: string;
}