import { IsIn, IsOptional, Max, MaxLength } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  product: string;

  @IsOptional()
  promo_text: string;

  @IsOptional()
  short_description: string;

  @IsOptional()
  list_price: number;

  @IsOptional()
  price: number;

  @IsOptional()
  @Max(100, { message: 'Tỉ lệ discount không đúng.' })
  percentage_discount: number = 0;

  @IsOptional()
  product_code: string;

  @IsOptional()
  barcode: string;

  @IsOptional()
  @MaxLength(1, { message: 'Product type chỉ chứa 1 ký tự' })
  product_type: string;

  @IsOptional()
  amount: number;

  @IsOptional()
  @IsIn(['Y', 'N'])
  approved: string = 'Y';

  @IsOptional()
  weight: number;

  @IsOptional()
  weight_type: string;

  @IsOptional()
  product_features: { feature_id: number; variant_id: number }[];

  @IsOptional()
  page_title: string;

  @IsOptional()
  meta_description: string;

  @IsOptional()
  alias: string;

  @IsOptional()
  @IsIn(['A', 'D'])
  status: string;

  @IsOptional()
  display_at: Date = new Date();

  @IsOptional()
  category_id: number;

  @IsOptional()
  company_id: number;

  @IsOptional()
  search_words: string;

  @IsOptional()
  meta_keywords: string;

  @IsOptional()
  sale_amount: number = 0;

  @IsOptional()
  code: string = '';

  @IsOptional()
  parent_product_id: number = 0;

  @IsOptional()
  purpose: string = '';

  @IsOptional()
  group_id: number = 0;
}
