import { IsOptional, IsNotEmpty, IsIn } from 'class-validator';

export class CreateOrUpdatePageDetailDto {
  @IsOptional()
  page_detail_id: number;

  @IsNotEmpty()
  page_id: number;

  @IsOptional()
  page_detail_code: string;

  @IsOptional()
  page_detail_data: string;

  @IsOptional()
  module_name: string;

  @IsOptional()
  description: string;

  @IsOptional()
  position: number;

  @IsOptional()
  url: string;

  @IsOptional()
  image: string;

  @IsOptional()
  @IsIn(['A', 'D'])
  status: string;

  @IsOptional()
  detail_type: number;

  @IsOptional()
  router: string;
}
