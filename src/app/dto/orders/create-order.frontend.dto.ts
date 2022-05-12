import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreateOrderFEDto {
  @IsOptional()
  b_firstname: string;

  @IsOptional()
  b_lastname: string;

  @IsOptional()
  b_phone: string;

  @IsOptional()
  b_city: string;

  @IsOptional()
  b_district: string;

  @IsOptional()
  b_ward: string;

  @IsOptional()
  b_address: string;

  @IsOptional()
  s_firstname: string;

  @IsOptional()
  s_lastname: string;

  @IsOptional()
  s_phone: string;

  @IsOptional()
  s_city: string;

  @IsOptional()
  s_district: string;

  @IsOptional()
  s_ward: string;

  @IsOptional()
  s_address: string;

  @IsOptional()
  coupon_code: string;

  @IsOptional()
  store_id: string;

  @IsOptional()
  email: string = '';

  @IsOptional()
  order_type: string = '1';

  @IsOptional()
  utm_source: string = '';

  @IsOptional()
  shipping_fee_location_id: number;

  @IsOptional()
  user_id: string;
}
