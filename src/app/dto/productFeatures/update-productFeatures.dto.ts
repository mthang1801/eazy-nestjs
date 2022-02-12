import { IsOptional } from 'class-validator';

export class UpdateProductFeatureDto {
  @IsOptional()
  feature_code: string;

  @IsOptional()
  company_id: number;

  @IsOptional()
  purpose: string;

  @IsOptional()
  feature_style: string;

  @IsOptional()
  filter_style: string;

  @IsOptional()
  feature_type: string;

  @IsOptional()
  categories_path: string;

  @IsOptional()
  parent_id: number;

  @IsOptional()
  display_on_product: string;

  @IsOptional()
  display_on_catalog: string;

  @IsOptional()
  display_on_header: string;

  @IsOptional()
  status: string;

  @IsOptional()
  position: string;

  @IsOptional()
  comparison: string;

  @IsOptional()
  description: string;

  @IsOptional()
  full_description: string;

  @IsOptional()
  prefix: string;

  @IsOptional()
  suffix: string;

  @IsOptional()
  lang_code: string;
}
