import { Type } from 'class-transformer';
import {
  IsOptional,
  IsNotEmpty,
  IsString,
  IsNumber,
  ValidateNested,
} from 'class-validator';

export class CreatePageDto {
  @IsNotEmpty()
  @IsString()
  page_name: string;

  @IsNotEmpty()
  @IsNumber()
  page_type: number = 1;

  @IsOptional()
  status: string = 'A';

  @IsOptional()
  link_url: string;

  @IsOptional()
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
  image: string;

  @IsOptional()
  status: string;

  @IsOptional()
  device_type: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PageDetailValue)
  page_detail_values: PageDetailValue[];

  @IsOptional()
  router: string = '';
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
