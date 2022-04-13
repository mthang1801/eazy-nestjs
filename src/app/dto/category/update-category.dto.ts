import { IsOptional, IsNotEmpty, IsIn } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  parent_id: number;

  @IsOptional()
  id_path: string;

  @IsOptional()
  level: number;

  @IsOptional()
  company_id: number;

  @IsOptional()
  usergroup_ids: string;

  @IsOptional()
  status: string;

  @IsOptional()
  product_count: number;

  @IsOptional()
  position: number;

  @IsOptional()
  is_op: string;

  @IsOptional()
  localization: string;

  @IsOptional()
  age_verification: string;

  @IsOptional()
  age_limit: number;

  @IsOptional()
  parent_age_verification: string;

  @IsOptional()
  parent_age_limit: number;

  @IsOptional()
  selected_views: string;

  @IsOptional()
  slug: string;

  @IsOptional()
  product_details_view: string;

  @IsOptional()
  product_columns: number;

  @IsOptional()
  is_trash: string;

  @IsOptional()
  category_type: string;

  @IsOptional()
  lang_code: string;

  @IsOptional()
  category: string;

  @IsOptional()
  description: string;

  @IsOptional()
  meta_keywords: string;

  @IsOptional()
  meta_description: string;

  @IsOptional()
  page_title: string;

  @IsOptional()
  age_warning_message: string;

  @IsOptional()
  display_at: Date;

  @IsOptional()
  products_list: string[];

  @IsOptional()
  image: string;

  @IsOptional()
  redirect_url: string;

  @IsOptional()
  @IsIn(['Y', 'N'])
  is_show_homepage: string;

  @IsOptional()
  url: string;

  @IsOptional()
  meta_image: string;

  @IsOptional()
  icon: string;

  @IsOptional()
  applied_products: number[];
}
