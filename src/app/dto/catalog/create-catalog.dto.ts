import { Type } from 'class-transformer';
import { stringShortener } from '../../../utils/helper';
import {
  IsNotEmpty,
  IsOptional,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
export class CreateCatalogDto {
  @IsNotEmpty()
  catalog_name: string;

  @IsOptional()
  status: string;

  @IsOptional()
  @Type(() => CatalogFeature)
  @ValidateNested()
  catalog_features: CatalogFeature[];
}

class CatalogFeature {
  @IsOptional()
  feature_name: string;

  @IsOptional()
  status: string;

  @IsOptional()
  @Type(() => CatalogFeatureDetail)
  @ValidateNested()
  catalog_feature_details: CatalogFeatureDetail[];
}

class CatalogFeatureDetail {
  @IsOptional()
  detail_name: string;

  @IsOptional()
  status: string;
}
