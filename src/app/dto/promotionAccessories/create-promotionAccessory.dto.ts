import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import {
  ArrayNotEmpty,
  IsDateString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreatePromotionAccessoryDto {
  @IsNotEmpty()
  accessory_code: string;

  @IsNotEmpty()
  accessory_name: string;

  @ArrayNotEmpty()
  product_ids: number[];

  @IsOptional()
  @ValidateNested()
  @Type(() => AccessoryProducts)
  products: AccessoryProducts[];

  @IsOptional()
  accessory_type: number = 1;

  @IsOptional()
  accessory_status: string = 'A';

  @IsOptional()
  @IsDateString()
  display_at: string;
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
