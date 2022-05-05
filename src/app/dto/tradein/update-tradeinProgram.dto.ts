import { Type } from 'class-transformer';

import {
  ArrayNotEmpty,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
export class UpdateTradeinProgramDto {
  @IsOptional()
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

  @IsOptional()
  @ValidateNested()
  @Type(() => TradeinProduct)
  applied_products: TradeinProduct[];

  @IsOptional()
  removed_products: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => TradeinCriteria)
  applied_criteria: TradeinCriteria[];

  @IsOptional()
  removed_criteria: string[];
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
  criteria_id: string;

  @IsOptional()
  position: number;

  @IsOptional()
  criteria_name: string;

  @IsOptional()
  criteria_status: string;

  @IsOptional()
  criteria_style: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => TradeinCriteriaDetail)
  applied_criteria_detail: TradeinCriteriaDetail[];

  @IsOptional()
  removed_criteria_detail: string[];
}

class TradeinCriteriaDetail {
  @IsOptional()
  criteria_detail_id: string;

  @IsOptional()
  criteria_detail_name: string;

  @IsOptional()
  criteria_detail_description: string;

  @IsOptional()
  accessory_category_id: number;

  @IsOptional()
  operator_type: string;

  @IsOptional()
  value: number;

  @IsOptional()
  criteria_type: number;
}
