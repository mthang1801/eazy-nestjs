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
  device_type: string = 'D';

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
  @ValidateNested()
  @Type(() => PageDetailValue)
  page_detail_values: PageDetailValue[];
}

class PageDetailValue {
  @IsOptional()
  name: string;

  @IsOptional()
  data_value: string;

  @IsOptional()
  position: number;

  @IsOptional()
  detail_status: string;
}
