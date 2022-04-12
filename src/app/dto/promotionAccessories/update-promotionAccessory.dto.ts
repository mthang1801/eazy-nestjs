import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class UpdatePromotionAccessoryDto {
  @IsOptional()
  accessory_code: string;

  @IsOptional()
  accessory_name: string;

  @IsOptional()
  accessory_type: number;

  @IsOptional()
  description: string;

  @IsOptional()
  applied_products: number[];

  @IsOptional()
  @ValidateNested()
  @Type(() => AccessoryProducts)
  products: AccessoryProducts[];

  @IsOptional()
  accessory_status: string = 'A';

  @IsOptional()
  @IsDateString()
  display_at: string;

  @IsOptional()
  @IsDateString()
  end_at: string;
}

class AccessoryProducts {
  @IsNotEmpty()
  product_id: number;

  @IsOptional()
  collect_price: number = 0;

  @IsOptional()
  promotion_price: number = 0;

  @IsOptional()
  sale_price_from: number = 0;

  @IsOptional()
  sale_price_to: number = 0;
}
