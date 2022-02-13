import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsOptional()
  parent_id: number;

  @IsOptional()
  id_path: string = '';

  @IsOptional()
  level: number = 1;

  @IsOptional()
  company_id: number = 0;

  @IsOptional()
  usergroup_ids: string = '0';

  @IsOptional()
  status: string = 'A';

  @IsOptional()
  product_count: number = 0;

  @IsOptional()
  position: number = 0;

  @IsOptional()
  is_op: string = 'N';

  @IsOptional()
  is_display: string = 'Y';

  @IsOptional()
  localization: string = '';

  @IsOptional()
  age_verification: string = 'N';

  @IsOptional()
  age_limit: number = 0;

  @IsOptional()
  parent_age_verification: string = 'N';

  @IsOptional()
  parent_age_limit: number = 0;

  @IsOptional()
  selected_views: string = '';

  @IsOptional()
  default_view: string = '';

  @IsOptional()
  product_details_view: string = '';

  @IsOptional()
  product_columns: number = 0;

  @IsOptional()
  is_trash: string = 'N';

  @IsOptional()
  category_type: string = 'C';

  @IsOptional()
  lang_code: string = 'vn';

  @IsOptional()
  category: string = '';

  @IsOptional()
  description: string = '';

  @IsOptional()
  meta_keywords: string = '';

  @IsOptional()
  meta_description: string = '';

  @IsOptional()
  page_title: string = '';

  @IsOptional()
  age_warning_message: string = '';

  @IsOptional()
  display_at: Date = new Date();
}
