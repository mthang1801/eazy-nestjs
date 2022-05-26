import { IsNotEmpty, IsOptional } from 'class-validator';
export class CreateOrUpdatePageDetailValueItemDto {
  @IsNotEmpty()
  page_detail_id: number;

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
  detail_type: string;
}
