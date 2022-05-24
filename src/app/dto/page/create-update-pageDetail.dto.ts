import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
export class CreateOrUpdatePageDetailDto {
  @IsOptional()
  @ValidateNested()
  @Type()
  page_details: number[];
}
