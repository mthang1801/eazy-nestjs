import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePayooInstallmentDto {
  @IsNotEmpty()
  product_id: number;

  @IsOptional()
  coupon_code: string;

  @IsOptional()
  s_firstname: string;

  @IsOptional()
  s_lastname: string;

  @IsNotEmpty()
  s_phone: string;

  @IsOptional()
  s_address: string;

  @IsNotEmpty()
  s_district: string;

  @IsOptional()
  s_city: string;

  @IsOptional()
  s_ward: string;

  @IsOptional()
  callback_url: string;

  @IsNotEmpty()
  method: string;

  @IsOptional()
  bank: string;

  @IsOptional()
  shipping_fee_location_id: number;
}
