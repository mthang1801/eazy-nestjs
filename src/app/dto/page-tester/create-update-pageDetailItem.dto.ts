import { IsOptional, IsNotEmpty, IsIn } from 'class-validator';

export class CreateOrUpdatePageDetailDto {
  @IsOptional()
  page_detail_id: number;

  @IsOptional()
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

  @IsOptional()
  page_detail_values: PageDetailValue[];
}

class PageDetailValue {
  @IsOptional()
  value_id: number;

  @IsOptional()
  page_detail_value_code: string;

  @IsOptional()
  page_detail_name: string;

  @IsOptional()
  data_value: string;

  @IsOptional()
  position: number;

  @IsOptional()
  detail_status: string;

  @IsOptional()
  image: string;

  @IsOptional()
  detail_type: number;
}
