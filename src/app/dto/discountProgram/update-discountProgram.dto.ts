import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import {
  IsOptional,
  IsString,
  IsIn,
  IsDate,
  IsNotEmpty,
  Min,
} from 'class-validator';
export class UpdateDiscountProgramDto {
  @IsOptional()
  @IsString()
  discount_name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsIn(['A', 'D'])
  status: string;

  @IsOptional()
  time_start_at: string;

  @IsOptional()
  time_end_at: string;

  @IsOptional()
  @Type(() => AppliedProduct)
  @ValidateNested()
  applied_products: AppliedProduct[];
}

class AppliedProduct {
  @IsNotEmpty()
  detail_id: number;

  @IsOptional()
  @IsIn(['A', 'D'])
  status: string;

  @IsOptional()
  @Min(0)
  position: number;
}
