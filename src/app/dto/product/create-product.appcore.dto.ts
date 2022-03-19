import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

export class CreateProductAppcoreDto {
  @IsNotEmpty()
  product_id: string;

  @IsNotEmpty()
  product: string;

  @IsOptional()
  product_status: string = 'A';

  @IsOptional()
  tax_name: null | string;

  @IsOptional()
  tax_ids: null | string;

  @IsOptional()
  price: number;

  @IsOptional()
  whole_price: number;

  @IsOptional()
  list_price: number;

  @IsOptional()
  collect_price: number;

  @IsOptional()
  product_code: null | string;

  @IsOptional()
  product_type: string = '2';

  @IsOptional()
  combo_amount: number;

  @IsOptional()
  barcode: string;

  @IsOptional()
  age_warning_message: string;

  @IsOptional()
  status: string = 'A';

  @IsOptional()
  display_at: string;

  @IsOptional()
  category_id: number;

  @IsOptional()
  parent_product_id: null | string | number;

  @IsOptional()
  slug: null | string;

  @IsOptional()
  promo_text: null | string;

  @IsOptional()
  short_description: null | string;

  @IsOptional()
  page_title: null | string;

  @IsOptional()
  meta_description: null | string;

  @IsOptional()
  alias: null | string;

  @IsOptional()
  weight: number;

  @IsOptional()
  length: number;

  @IsOptional()
  width: number;

  @IsOptional()
  images: string[];

  @IsOptional()
  color: string;

  @IsOptional()
  size: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductComboItems)
  combo_items: ProductComboItems[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductFeature)
  product_features: ProductFeature[];
}

class ProductFeature {
  @IsNotEmpty()
  feature_code: number;

  @IsNotEmpty()
  variant_code: number;
}

class ProductComboItems {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  product_id: string;

  @IsNotEmpty()
  product_combo_id: string;

  @IsNotEmpty()
  quantity: number;
}
