import { Type } from 'class-transformer';
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

  @ArrayNotEmpty()
  @Type(() => CatalogFeature)
  @ValidateNested()
  features: CatalogFeature[];
}

class CatalogFeature {
  @IsNotEmpty()
  feature: string;

  @IsOptional()
  status: string;
}
