import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  Max,
  MaxLength,
  Min,
  min,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  product: string;

  @IsNotEmpty()
  promo_text: string;

  @IsNotEmpty()
  short_description: string;

  @IsNotEmpty()
  @Min(0, { message: 'Không được nhỏ hơn 0' })
  list_price: number; // Giá niêm yết

  @IsNotEmpty()
  price: number; // Giá bán lẻ

  @IsOptional()
  collect_price: number = 0; //Giá thu gom

  @IsOptional()
  whole_price: number = 0; //Giá bản sỉ

  @IsOptional()
  @Max(100, { message: 'Tỉ lệ discount không đúng.' })
  percentage_discount: number = 0;

  @IsNotEmpty()
  product_code: string;

  @IsNotEmpty()
  barcode: string;

  @IsOptional()
  @MaxLength(1, { message: 'Product type chỉ chứa 1 ký tự' })
  product_type: string = 'P';

  @IsOptional()
  product_status: string = 'A';

  @IsOptional()
  amount: number;

  @IsOptional()
  approved: string = 'Y';

  @IsNotEmpty()
  weight: number;

  @IsOptional()
  length: number = 0;

  @IsOptional()
  width: number = 0;

  @IsOptional()
  height: number = 0;

  @IsOptional()
  tax_name: string = '';

  @IsOptional()
  tax_ids: string = '';

  @IsOptional()
  slug: string = '';

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
  status: string = 'A';

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

  @IsOptional()
  children_products: ChildrenProductDto[] = [];
}

class ChildrenProductDto {
  @IsOptional()
  product_features: { feature_id: number; variant_id: number }[];

  @IsOptional()
  buy_price: number = 0;

  @IsNotEmpty()
  price: number = 0;

  @IsNotEmpty()
  product: string;

  @IsNotEmpty()
  promo_text: string;

  @IsNotEmpty()
  short_description: string;

  @IsNotEmpty()
  @Min(0, { message: 'Không được nhỏ hơn 0' })
  list_price: number; // Giá niêm yết

  @IsOptional()
  collect_price: number = 0; //Giá thu gom

  @IsOptional()
  whole_price: number = 0; //Giá bản sỉ

  @IsOptional()
  @Max(100, { message: 'Tỉ lệ discount không đúng.' })
  percentage_discount: number = 0;

  @IsNotEmpty()
  barcode: string;

  @IsOptional()
  @MaxLength(1, { message: 'Product type chỉ chứa 1 ký tự' })
  product_type: string = 'P';

  @IsOptional()
  product_status: string = 'A';

  @IsOptional()
  amount: number;

  @IsOptional()
  approved: string = 'Y';

  @IsNotEmpty()
  weight: number;

  @IsOptional()
  length: number = 0;

  @IsOptional()
  width: number = 0;

  @IsOptional()
  height: number = 0;

  @IsOptional()
  tax_name: string = '';

  @IsOptional()
  tax_ids: string = '';

  @IsOptional()
  slug: string = '';

  @IsOptional()
  page_title: string;

  @IsOptional()
  meta_description: string;

  @IsOptional()
  alias: string;

  @IsOptional()
  @IsIn(['A', 'D'])
  status: string = 'A';

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
