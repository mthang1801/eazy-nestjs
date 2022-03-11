import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreateCustomerAppcoreDto {
  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  user_appcore_id: number;

  @IsOptional()
  firstname: string;

  @IsOptional()
  lastname: string;

  @IsOptional()
  gender: string;

  @IsOptional()
  email: string;

  @IsOptional()
  birthday: null | string;

  @IsOptional()
  b_city: string;

  @IsOptional()
  b_district: string;

  @IsOptional()
  b_ward: string;

  @IsOptional()
  address: string;

  @IsOptional()
  created_at: string;

  @IsOptional()
  updated_at: string;

  @IsOptional()
  type: number;
}
