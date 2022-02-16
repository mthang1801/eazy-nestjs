import { IsIn, IsOptional, Max, MaxLength, IsNotEmpty } from 'class-validator';

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

  @IsNotEmpty()
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

  @IsOptional()
  shortname: string = ''; //product descriptions

  @IsOptional()
  full_description: string = ''; //product descriptions

  @IsOptional()
  lang_code: string = 'vn'; //product descriptions

  @IsOptional()
  age_warning_message: string = ''; //product descriptions

  @IsOptional()
  lower_limit: number = 0; //product price

  @IsOptional()
  usergroup_id: number = 0; //product price

  @IsOptional()
  link_type: string = 'M'; // product category

  @IsOptional()
  position: number = 0; // product position

  @IsOptional()
  category_position: number = 0; // product position
}
