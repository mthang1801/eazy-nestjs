import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCustomerDto {
  @IsOptional()
  firstname: string;

  @IsOptional()
  lastname: string;

  @IsOptional()
  email: string;

  @IsNotEmpty()
  phone: string;

  @IsOptional()
  birthday: string;

  @IsOptional()
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
}
