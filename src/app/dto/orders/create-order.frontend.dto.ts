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

  @IsNotEmpty()
  s_phone: string;

  @IsNotEmpty()
  s_city: string;

  @IsNotEmpty()
  s_district: string;

  @IsNotEmpty()
  s_ward: string;

  @IsNotEmpty()
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
}
