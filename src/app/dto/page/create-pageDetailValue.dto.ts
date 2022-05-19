import { Type } from 'class-transformer';
import { ArrayNotEmpty, ValidateNested, IsOptional } from 'class-validator';
export class CreatePageDetailValueDto {
  @IsOptional()
  value_id: number;

  @IsOptional()
  page_detail_id: number;

  @IsOptional()
  page_detail_name: string;

  @IsOptional()
  data_value: string;

  @IsOptional()
  position: number;

  @IsOptional()
  detail_status: string;

  @IsOptional()
  image: string = '';
}
