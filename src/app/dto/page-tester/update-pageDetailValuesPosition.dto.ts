import { Type } from 'class-transformer';

import {
  IsOptional,
  IsNotEmpty,
  IsString,
  IsNumber,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';

export class UpdatePageDetailValuesPositionDto {
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => PageDetailValue)
  page_detail_values: PageDetailValue[];
}

class PageDetailValue {
  @IsNotEmpty()
  value_id: number;

  @IsNotEmpty()
  position: number;

  @IsOptional()
  status: string;
}
