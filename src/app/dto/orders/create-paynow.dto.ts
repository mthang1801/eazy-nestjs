import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePaynowDto {
  @IsNotEmpty()
  user_id: string;

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

  @IsOptional()
  method: string;

  @IsOptional()
  bank: string;
}
