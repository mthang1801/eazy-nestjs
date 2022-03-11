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
