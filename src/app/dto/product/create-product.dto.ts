import { IsNotEmpty, IsOptional, Max, MaxLength } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  product: string;

  @IsNotEmpty()
  promo_text: string;

  @IsNotEmpty()
  short_description: string;

  @IsNotEmpty()
  image_urls: string[];

  @IsNotEmpty()
  list_price: number;

  @IsNotEmpty()
  price: number;

  @IsOptional()
  @Max(100, { message: 'Tỉ lệ discount không đúng.' })
  percentage_discount: number = 0;

  @IsNotEmpty()
  product_code: string;

  @IsNotEmpty()
  barcode: string;

  @IsNotEmpty()
  @MaxLength(1, { message: 'Product type chỉ chứa 1 ký tự' })
  product_type: string;

  @IsNotEmpty()
  amount: number;

  @IsOptional()
  approved: string = 'Y';

  @IsNotEmpty()
  weight: number;

  @IsNotEmpty()
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
  status: string;

  @IsOptional()
  display_at: Date = new Date();

  @IsNotEmpty()
  category_id: number;

  @IsNotEmpty()
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
