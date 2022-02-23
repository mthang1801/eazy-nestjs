import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreateCategoryV2Dto {
  @IsOptional()
  parent_id: null | number = 0;

  @IsNotEmpty({ message: 'Tên danh mục là bắt buộc' })
  category: string = '';

  @IsNotEmpty()
  page_title: string;

  @IsOptional()
  status: string = 'A';

  @IsOptional()
  display_at: Date = new Date();

  @IsOptional()
  meta_keywords: string = '';

  @IsOptional()
  meta_description: string = '';

  @IsNotEmpty()
  slug: string;

  @IsOptional()
  level: number = 0;

  @IsOptional()
  description: string = '';
}
