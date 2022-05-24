import { Type } from 'class-transformer';

import {
  IsOptional,
  IsNotEmpty,
  IsString,
  IsNumber,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';

export class UpdatePageDetailsPosition {
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => PageDetail)
  page_details: PageDetail[];
}

class PageDetail {
  @IsOptional()
  page_detail_id: number;

  @IsOptional()
  position: number;
}
