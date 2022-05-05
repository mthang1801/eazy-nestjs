import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateOrderSelfTransportDto {
  @IsNotEmpty()
  b_lastname: string;

  @IsNotEmpty()
  b_phone: string;

  @IsOptional()
  email: string = '';

  @IsNotEmpty()
  store_id: number;

  @IsOptional()
  order_code: string;

  @IsOptional()
  user_id: string;

  @IsOptional()
  coupon_code: string;

  @IsOptional()
  order_type: string;
}
