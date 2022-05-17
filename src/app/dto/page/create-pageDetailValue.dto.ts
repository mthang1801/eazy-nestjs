import { Type } from 'class-transformer';
import { ArrayNotEmpty, ValidateNested, IsOptional } from 'class-validator';
export class CreatePageDetailValueDto {
  @ArrayNotEmpty()
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

  @IsOptional()
  router: string = '';
}
