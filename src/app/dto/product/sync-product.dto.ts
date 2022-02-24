import { IsOptional } from 'class-validator';
export class SyncProductDto {
  @IsOptional()
  product: string = '';

  @IsOptional()
  product_status: string = 'A';

  @IsOptional()
  tax_name: string = '';

  @IsOptional()
  tax_ids: string = '';

  @IsOptional()
  price: number = 0;

  @IsOptional()
  whole_price: number = 0;

  @IsOptional()
  list_price: number = 0;

  @IsOptional()
  collect_price: number = 0;

  @IsOptional()
  product_code: string = '';

  @IsOptional()
  barcode: string = '';

  @IsOptional()
  age_warning_message: string = '';

  @IsOptional()
  status: string = 'A';

  @IsOptional()
  display_at: Date = new Date();

  @IsOptional()
  category_id: number = 0;

  @IsOptional()
  parent_product_id: null | number = 0;

  @IsOptional()
  slug: string = '';

  @IsOptional()
  promo_text: string = '';

  @IsOptional()
  short_description: string = '';

  @IsOptional()
  page_title: string = '';

  @IsOptional()
  meta_description: string = '';

  @IsOptional()
  alias: string = '';

  @IsOptional()
  weight: number = 0;

  @IsOptional()
  length: number = 0;
  @IsOptional()
  width: number = 0;

  @IsOptional()
  height: number = 0;

  @IsOptional()
  product_features: ProductFeature[] = [];
}

class ProductFeature {
  feature_code: string;
  variant_code: string;
}
