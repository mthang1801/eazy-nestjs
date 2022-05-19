import { Type } from 'class-transformer';
import { ArrayNotEmpty } from 'class-validator';
import {
  IsOptional,
  IsNotEmpty,
  IsString,
  IsNumber,
  ValidateNested,
} from 'class-validator';

export class CreatePageDetailItemDto {
  @IsOptional()
  page_id: number;

  @IsOptional()
  page_detail_id: number;

  @IsOptional()
  module_name: string;

  @IsOptional()
  description: string;

  @IsOptional()
  position: number;

  @IsOptional()
  url: string;

  @IsOptional()
  page_detail_data: string;

  @IsOptional()
  image: string;

  @IsOptional()
  status: string;

  @IsOptional()
  device_type: string;

  @IsOptional()
  router: string = '';
}
