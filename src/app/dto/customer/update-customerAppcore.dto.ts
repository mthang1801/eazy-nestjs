import { IsOptional } from 'class-validator';

export class UpdateCustomerAppcoreDto {
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
  created_at: string;

  @IsOptional()
  updated_at: string;

  @IsOptional()
  type: number;

  @IsOptional()
  address: string;
}
