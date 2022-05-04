import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePaymentSelfTransportDto {
  @IsNotEmpty()
  user_id: string;

  @IsOptional()
  coupon_code: string;

  @IsOptional()
  b_lastname: string;

  @IsNotEmpty()
  b_phone: string;

  @IsOptional()
  callback_url: string;

  @IsNotEmpty()
  method: string;

  @IsOptional()
  bank: string;

  @IsNotEmpty()
  store_id: number;
}
