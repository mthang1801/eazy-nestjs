import { Type } from 'class-transformer';
import { stringShortener } from '../../../utils/helper';
import {
  IsNotEmpty,
  IsOptional,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
export class UpdateCatalogDto {
  @IsOptional()
  catalog_name: string;

  @IsOptional()
  status: string;

  @IsOptional()
  @Type(() => CatalogFeature)
  @ValidateNested()
  features: CatalogFeature[];
}

class CatalogFeature {
  @IsOptional()
  catalog_feature_id: number;  

  @IsOptional()
  feature_name: string;

  @IsOptional()
  status: string;

  @IsOptional()
  @Type(() => CatalogFeatureDetail)
  @ValidateNested()
  featureDetails: CatalogFeatureDetail[];
}

class CatalogFeatureDetail {
  @IsOptional()
  detail_id: number;

  @IsOptional()
  detail_name: string;

  @IsOptional()
  status: string;
}