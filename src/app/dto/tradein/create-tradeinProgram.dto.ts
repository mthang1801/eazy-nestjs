import { Type } from 'class-transformer';

import {
  ArrayNotEmpty,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
export class CreateTradeinProgramDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsDateString()
  @IsOptional()
  start_at: string;

  @IsDateString()
  @IsOptional()
  end_at: string;

  @IsOptional()
  status: string;

  @IsOptional()
  discount_rate: number;

  @IsOptional()
  @IsString()
  description: string;

  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => TradeinProduct)
  applied_products: TradeinProduct[];

  @IsOptional()
  @ValidateNested()
  @Type(() => TradeinCriteria)
  applied_criteria: TradeinCriteria[];
}

class TradeinProduct {
  @IsNotEmpty()
  product_id: number;

  @IsOptional()
  detail_status: string;

  @IsOptional()
  position: number;
}

class TradeinCriteria {
  @IsOptional()
  position: number;

  @IsNotEmpty()
  criteria_name: string;

  @IsOptional()
  criteria_status: string;

  @IsOptional()
  criteria_style: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => TradeinCriteriaDetail)
  applied_criteria_detail: TradeinCriteriaDetail[];
}

class TradeinCriteriaDetail {
  @IsNotEmpty()
  criteria_detail_name: string;

  @IsOptional()
  criteria_detail_description: string;

  @IsNotEmpty()
  accessory_category_id: number;

  @IsOptional()
  operator_type: string;

  @IsNotEmpty()
  value: number;

  @IsOptional()
  criteria_type: number;
}
