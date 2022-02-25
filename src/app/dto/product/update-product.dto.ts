import { IsIn, IsOptional, IsNotEmpty, Min, Max } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  product_code: string;

  @IsOptional()
  barcode: string;

  @IsOptional()
  product_type: string;

  @IsOptional()
  product_status: string;

  @IsOptional({ message: 'Trạng thái hiển thị chỉ có thể là A hoặc D' })
  @IsIn(['A', 'D'])
  status: string;

  @IsOptional()
  company_id: number;

  @IsOptional({ message: 'Chỉ có thể Y hoặc N' })
  @IsIn(['Y', 'N'])
  approved: string;

  @IsOptional()
  list_price: number;

  @IsOptional()
  amount: number;

  @IsOptional()
  weight: number;

  @IsOptional()
  length: number;

  @IsOptional()
  width: number;

  @IsOptional()
  height: number;

  @IsOptional()
  tax_ids: string;

  @IsOptional()
  shipping_freight: number;

  @IsOptional()
  low_avail_limit: number;

  @IsOptional()
  usergroup_ids: string;

  @IsOptional({ message: 'is_edp chỉ có thể Y hoặc N' })
  @IsIn(['Y', 'N'])
  is_edp: string;

  @IsOptional()
  @IsOptional({ message: 'edp_shipping chỉ có thể Y hoặc N' })
  edp_shipping: string;

  @IsOptional()
  unlimited_download: string;

  @IsOptional()
  tracking: string;

  @IsOptional()
  @IsOptional({ message: 'free_shipping chỉ có thể Y hoặc N' })
  free_shipping: string;

  @IsOptional()
  zero_price_action: string;

  @IsOptional()
  is_pbp: string;

  @IsOptional()
  is_op: string;

  @IsOptional()
  is_oper: string;

  @IsOptional()
  is_returnable: string;

  @IsOptional()
  return_period: number;

  @IsOptional()
  avail_since: number;

  @IsOptional()
  out_of_stock_actions: string;

  @IsOptional()
  localization: string;

  @IsOptional()
  min_qty: number;

  @IsOptional()
  max_qty: number;

  @IsOptional()
  qty_step: number;

  @IsOptional()
  list_qty_count: number;

  @IsOptional()
  tax_name: string;

  @IsOptional()
  slug: string;

  @IsOptional()
  age_verification: string;

  @IsOptional()
  age_limit: number;

  @IsOptional()
  options_type: string;

  @IsOptional()
  exceptions_type: string;

  @IsOptional()
  details_layout: string;

  @IsOptional()
  shipping_params: string;

  @IsOptional()
  facebook_obj_type: string;

  @IsOptional()
  buy_now_url: string;

  // product description

  @IsOptional()
  lang_code: string;

  @IsOptional()
  product: string;

  @IsOptional()
  shortname: string;

  @IsOptional()
  alias: string;

  @IsOptional()
  short_description: string;

  @IsOptional()
  full_description: string;

  @IsOptional()
  meta_keywords: string;

  @IsOptional()
  meta_description: string;

  @IsOptional()
  search_words: string;

  @IsOptional()
  page_title: string;

  @IsOptional()
  age_warning_message: string;

  @IsOptional()
  promo_text: string;

  // product sales

  @IsOptional()
  sale_amount: number;

  // Product price

  @IsOptional()
  price: number;

  @IsOptional()
  collect_price: number; //Giá thu gom

  @IsOptional()
  whole_price: number; //Giá bản sỉ

  @IsOptional()
  buy_price: number;

  @IsOptional()
  @Max(100, { message: 'percentage_discount Không vượt quá 100' })
  percentage_discount: number;

  @IsOptional()
  lower_limit: number;

  @IsOptional()
  usergroup_id: number;

  // product category

  @IsOptional()
  category_id: number;

  @IsOptional()
  link_type: string;

  @IsOptional()
  position: number;

  @IsOptional()
  category_position: number;

  // product group
  @IsOptional()
  parent_product_id: number;

  @IsOptional()
  group_id: number;

  @IsOptional()
  product_features: ProductFeatureValueDto[];

  @IsOptional()
  display_at: Date;

  @IsOptional()
  children_products: UpdateProductDto[];
}

class ProductFeatureValueDto {
  @IsNotEmpty()
  feature_id: number;

  @IsNotEmpty()
  product_id: number;

  @IsNotEmpty()
  variant_id: number;

  @IsOptional()
  value: string;

  @IsOptional()
  value_int: number;

  @IsOptional()
  lang_code: string;
}
