import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  Max,
  MaxLength,
  Min,
  min,
  Matches,
  ValidateNested,
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
  @Min(0, { message: 'price không được nhỏ hơn 0' })
  price: number; // Giá bán lẻ

  @IsOptional()
  @Min(0, { message: 'collect_price không được nhỏ hơn 0' })
  collect_price: number = 0; //Giá thu gom

  @IsOptional()
  @Min(0, { message: 'whole_price không được nhỏ hơn 0' })
  whole_price: number = 0; //Giá bản sỉ

  @IsOptional()
  @Max(100, { message: 'Tỉ lệ discount không đúng.' })
  @Min(0, { message: 'percentage_discount không được nhỏ hơn 0' })
  percentage_discount: number = 0;

  @IsNotEmpty()
  product_code: string;

  @IsNotEmpty()
  barcode: string;

  @IsOptional()
  @MaxLength(1, { message: 'Product type chỉ chứa 1 ký tự' })
  product_type: number = 1;

  @IsOptional()
  product_status: string = 'A';

  @IsOptional()
  @Min(0, { message: 'amount không được nhỏ hơn 0' })
  amount: number;

  @IsOptional()
  @IsIn(['Y', 'N'], { message: 'approved chỉ cho phép Y hoặc N' })
  approved: string = 'Y';

  @IsNotEmpty()
  @Min(0, { message: 'weight không được nhỏ hơn 0' })
  weight: number;

  @IsOptional()
  @Min(0, { message: 'length không được nhỏ hơn 0' })
  length: number = 0;

  @IsOptional()
  @Min(0, { message: 'width không được nhỏ hơn 0' })
  width: number = 0;

  @IsOptional()
  @Min(0, { message: 'height không được nhỏ hơn 0' })
  height: number = 0;

  @IsOptional()
  tax_name: string = '';

  @IsOptional()
  tax_ids: string = '';

  @IsNotEmpty({ message: 'slug là bắt buộc' })
  slug: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ProductFeatureDto)
  product_features: ProductFeatureDto[] = [];

  @IsNotEmpty({ message: 'page_title là bắt buộc' })
  page_title: string;

  @IsNotEmpty({ message: 'meta_description là bắt buộc' })
  meta_description: string;

  @IsOptional()
  alias: string = '';

  @IsOptional()
  @IsIn(['A', 'D'], { message: 'status chỉ có thể là A hoặc D.' })
  status: string = 'A';

  @IsOptional()
  display_at: Date = new Date();

  @IsNotEmpty({ message: 'category_id là bắt buộc' })
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
  parent_product_id: null | string;

  @IsOptional()
  purpose: string = '';

  @IsOptional()
  group_id: number = 0;

  @IsOptional()
  shortname: string = ''; //product descriptions

  @IsOptional()
  full_description: string = ''; //product descriptions

  @IsOptional()
  lang_code: string = 'vi'; //product descriptions

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
  children_products: CreateProductDto[] = [];

  @IsOptional()
  size: string = '';

  @IsOptional()
  color: string = '';
}

class ProductFeatureDto {
  @IsNotEmpty()
  feature_id: number;

  @IsNotEmpty()
  variant_id: number;
}
