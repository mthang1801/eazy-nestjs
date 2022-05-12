import { IsNumber, IsString, IsOptional } from 'class-validator';

export class UpdateCategoryFeatureDto{
    @IsOptional()
    categoryFeatures: CategoryFeature[];
}

class CategoryFeature{
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