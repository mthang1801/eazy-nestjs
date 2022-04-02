import { Type } from 'class-transformer';
import { IsOptional, IsNotEmpty, ValidateNested, IsIn } from 'class-validator';

export class UpdateProductFeatureAppcoreDto {
  @IsNotEmpty()
  description: string = '';

  @IsOptional()
  status: string;

  @IsOptional()
  feature_values: FeatureValueDto[];
}

class FeatureValueDto {
  @IsNotEmpty()
  variant: string;

  @IsNotEmpty()
  variant_code: string;

  @IsOptional()
  status: string;
}
