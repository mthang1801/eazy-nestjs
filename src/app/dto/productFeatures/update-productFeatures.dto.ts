import { IsIn, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { IProductFeatureVariantsResponse } from '../../interfaces/productFeatureVariantsResponse.interface';
import { Type } from 'class-transformer';

export class UpdateProductFeatureDto {
  @IsOptional({ message: 'Feature Code là bắt buộc.' })
  feature_code: string;

  @IsOptional()
  company_id: number;

  @IsOptional()
  purpose: string;

  @IsOptional()
  is_singly_choosen: string;

  @IsOptional({ message: 'Tên thuộc tính là bắt buộc.' })
  description: string;

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
  position: number;

  @IsOptional()
  comparison: string;

  @IsOptional()
  full_description: string;

  @IsOptional()
  prefix: string;

  @IsOptional()
  suffix: string;

  @IsOptional()
  lang_code: string;

  @IsNotEmpty({ message: 'Giá trị thuộc tính là bắt buộc.' })
  @ValidateNested({ each: true })
  @Type(() => ProductVariant)
  feature_values: ProductVariant[] = [];
}

class ProductVariant {
  @IsOptional()
  variant_id: number;

  @IsOptional()
  variant_code: number;

  @IsNotEmpty()
  variant: string;

  @IsOptional()
  description: string;

  @IsOptional()
  page_title: string;

  @IsOptional()
  meta_keywords: string;

  @IsOptional()
  meta_description: string;

  @IsOptional()
  lang_code: string;

  @IsOptional()
  url: string;

  @IsOptional()
  position: number;

  @IsOptional()
  color: string;
}
