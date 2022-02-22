import { IsNotEmpty, IsOptional, IsIn, Min } from 'class-validator';

export class CreateCategoryDto {
  @IsOptional()
  parent_id: number | null;

  @IsOptional()
  id_path: string = '';

  @IsOptional()
  level: number = 0;

  @IsOptional()
  company_id: number = 0;

  @IsOptional()
  usergroup_ids: string = '0';

  @IsOptional()
  @IsIn(['A', 'D'], { message: 'Trạng thái hiển thị chỉ có thể là A hoặc D' })
  status: string = 'A';

  @IsOptional()
  @Min(0, { message: 'product_count không được nhỏ hơn 0' })
  product_count: number = 0;

  @IsOptional()
  position: number = 0;

  @IsOptional()
  @IsIn(['Y', 'N'])
  is_op: string = 'N';

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
  slug: string = '';

  @IsOptional()
  product_details_view: string = '';

  @IsOptional()
  product_columns: number = 0;

  @IsOptional()
  is_trash: string = 'N';

  @IsOptional()
  category_type: string = 'C';

  @IsOptional()
  lang_code: string = 'vi';

  @IsNotEmpty({ message: 'Tên danh mục là bắt buộc' })
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

  @IsOptional()
  products_list: string[] = [];

  @IsOptional()
  image: string = '';
}
