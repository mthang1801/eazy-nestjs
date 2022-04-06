import { IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateCustomerDto {
  @IsOptional()
  firstname: string;

  @IsOptional()
  lastname: string;

  @IsOptional()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  phone: string;

  @IsOptional()
  birthday: string;

  @IsOptional()
  @IsIn([0, 1])
  gender: number = 0;

  @IsOptional()
  type: string = '1';

  @IsOptional()
  b_city: string;

  @IsOptional()
  b_district: string;

  @IsOptional()
  b_ward: string;

  @IsOptional()
  b_address: string;

  @IsOptional()
  note: string;

  @IsOptional()
  loyalty_point: number = 0;

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
  created_by: number;
}
