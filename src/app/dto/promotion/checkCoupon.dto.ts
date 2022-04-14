import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

export class CheckCouponDto {
  @IsOptional()
  store_id: number;

  @IsNotEmpty()
  coupon_code: string;

  @IsOptional()
  coupon_programing_id: string;

  @IsOptional()
  phone: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Product)
  products: Product[];
}

export class Product {
  @IsNotEmpty()
  product_id: number;

  @IsNotEmpty()
  amount: number;
}
