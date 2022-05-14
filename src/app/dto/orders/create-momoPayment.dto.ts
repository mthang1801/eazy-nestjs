import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMomoPaymentDto {
  @IsNotEmpty()
  user_id: string;

  @IsOptional()
  coupon_code: string;

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
  callback_url: string = '/payment/success';

  @IsOptional()
  shipping_fee_location_id: number;
}
