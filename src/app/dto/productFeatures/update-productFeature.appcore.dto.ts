import { Type } from 'class-transformer';
import { IsOptional, IsNotEmpty, ValidateNested } from 'class-validator';

export class UpdateProductFeatureDto {
  @IsNotEmpty()
  description: string = '';

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
