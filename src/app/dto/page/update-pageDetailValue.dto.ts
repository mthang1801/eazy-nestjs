import { Type } from 'class-transformer';
import { ArrayNotEmpty, ValidateNested, IsOptional } from 'class-validator';
export class UpdatePageDetailValueDto {
  @ArrayNotEmpty()
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
  status: string;

  @IsOptional()
  image: string = '';
}
