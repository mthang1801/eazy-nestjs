import { IsOptional, IsNotEmpty } from 'class-validator';
export class CreateInstallmentDto {
  @IsNotEmpty()
  product_id: number;

  @IsNotEmpty()
  s_lastname: string;

  @IsNotEmpty()
  s_phone: string;

  @IsOptional()
  email: string;

  @IsNotEmpty()
  id_card: string;

  @IsOptional()
  birthday: string;

  @IsOptional()
  s_city: string;

  @IsOptional()
  s_district: string;

  @IsOptional()
  s_ward: string;

  @IsOptional()
  s_address: string;

  @IsOptional()
  tenor: number;

  @IsOptional()
  prepaid_percentage: number;

  @IsOptional()
  company_id: number;

  @IsOptional()
  shipping_fee_location_id: number;
}
