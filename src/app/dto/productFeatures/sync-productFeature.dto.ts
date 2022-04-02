import { Type } from 'class-transformer';
import { IsOptional, IsNotEmpty, ValidateNested, IsIn } from 'class-validator';

export class SyncProductFeatureDto {
  @IsNotEmpty()
  description: string = '';

  @IsNotEmpty()
  feature_code: string = '';

  @IsOptional()
  status: string = 'A';

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => FeatureValueDto)
  feature_values: FeatureValueDto[];
}

class FeatureValueDto {
  @IsNotEmpty()
  variant: string;

  @IsNotEmpty()
  variant_code: string;

  @IsOptional()
  status: string = 'A';
}
