import { Type } from 'class-transformer';
import { ArrayNotEmpty } from 'class-validator';
import {
  IsOptional,
  IsNotEmpty,
  IsString,
  IsNumber,
  ValidateNested,
} from 'class-validator';

export class CreatePageDetailDto {
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => PageDetail)
  page_details: PageDetail[];
}

class PageDetail {
  @IsNotEmpty()
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

  @IsOptional()
  @ValidateNested()
  @Type(() => PageDetailValue)
  page_detail_values: PageDetailValue[];
}

class PageDetailValue {
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
