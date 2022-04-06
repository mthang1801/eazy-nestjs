import { IsIn, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  product: string;

  @IsOptional()
  product_code: string;

  @IsOptional()
  barcode: string;

  @IsOptional()
  company_id: number;

  @IsOptional()
  sale_amount: number;

  @IsOptional()
  tax_name: string;

  @IsOptional()
  tax_ids: string;

  @IsOptional()
  list_price: number; // Giá niêm yết

  @IsOptional()
  price: number; // Giá bán lẻ

  @IsOptional()
  collect_price: number = 0; //Giá thu gom

  @IsOptional()
  whole_price: number = 0; //Giá bản sỉ

  @IsOptional()
  product_features: ProductFeatureDto[];

  @IsOptional()
  product_status: string; // Tình trạng

  @IsOptional()
  product_type: number;

  @IsOptional()
  @IsIn(['A', 'D'])
  status: string; // Trạng thái hiển thị

  @IsOptional()
  display_at: string;

  @IsOptional()
  category_id: number[];

  @IsOptional()
  parent_product_id: null | string;

  @IsOptional()
  quantity: number;

  @IsOptional()
  slug: string;

  @IsOptional()
  promo_text: string;

  @IsOptional()
  short_description: string;

  @IsOptional()
  page_title: string;

  @IsOptional()
  meta_description: string;

  @IsOptional()
  meta_keywords: string;

  @IsOptional()
  alias: string;

  @IsOptional()
  weight: number;

  @IsOptional()
  length: number;

  @IsOptional()
  height: number;

  @IsOptional()
  width: number;

  @IsOptional()
  children_products: UpdateProductDto[];

  @IsOptional()
  images: string[];

  @IsOptional()
  url_media: string;

  @IsOptional()
  type: string;

  @IsOptional()
  other_info: string;

  @IsOptional()
  product_hover: string;

  @IsOptional()
  promotion_note: string;

  @IsOptional()
  promotion_info: string;

  @IsOptional()
  online_gifts: string;

  @IsOptional()
  open_new_tab: string;

  @IsOptional()
  status_type: string;

  @IsOptional()
  catalog_category_id: number;

  @IsOptional()
  redirect_url: string;

  @IsOptional()
  is_installment: string;

  @IsOptional()
  promotion_accessory_id: number;

  @IsOptional()
  warranty_package_id: number;

  @IsOptional()
  free_accessory_id: number;

  @IsOptional()
  joined_products: number[];
}

class ProductFeatureDto {
  @IsNotEmpty()
  feature_id: number;

  @IsNotEmpty()
  variant_id: number;
}
