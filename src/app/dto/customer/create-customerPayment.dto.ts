import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCustomerPaymentDto {
  @IsNotEmpty()
  s_lastname: string;

  @IsNotEmpty()
  s_phone: string;

  @IsOptional()
  s_city: string = '';

  @IsOptional()
  s_district: string = '';

  @IsOptional()
  s_ward: string = '';

  @IsNotEmpty()
  s_address: string;

  @IsOptional()
  identifier_number: string = '';
}
