import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProductFeatureDto {
  @IsNotEmpty({ message: 'Code là bắt buộc.' })
  feature_code: string;

  @IsOptional()
  company_id: number = 0;

  @IsOptional()
  purpose: string = '';

  @IsNotEmpty({ message: 'Tên thuộc tính là bắt buộc.' })
  description: string;

  @IsOptional()
  feature_style: string = '';

  @IsOptional()
  filter_style: string = '';

  @IsOptional()
  feature_type: string = 'T';

  @IsOptional()
  categories_path: string = '';

  @IsOptional()
  parent_id: number = 0;

  @IsOptional()
  display_on_product: string = 'Y';

  @IsOptional()
  display_on_catalog: string = 'Y';

  @IsOptional()
  display_on_header: string = 'N';

  @IsOptional()
  status: string = 'A';

  @IsOptional()
  position: number = 0;

  @IsOptional()
  comparison: string = 'N';

  @IsOptional()
  full_description: string = '';

  @IsOptional()
  prefix: string = '';

  @IsOptional()
  suffix: string = '';

  @IsOptional()
  lang_code: string = 'vn';

  @IsNotEmpty({ message: 'Giá trị thuộc tính là bắt buộc.' })
  feature_values: ProductVariant[] = [];
}

class ProductVariant {
  @IsNotEmpty()
  variant: string = '';

  @IsOptional()
  description: string = '';

  @IsOptional()
  page_title: string = '';

  @IsOptional()
  meta_keywords: string = '';

  @IsOptional()
  meta_description: string = '';

  @IsOptional()
  lang_code: string = 'vn';

  @IsOptional()
  url: string = '';

  @IsOptional()
  position: number = 0;

  @IsOptional()
  color: string = '';
}
