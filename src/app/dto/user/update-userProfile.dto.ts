import { IsOptional } from 'class-validator';

export class UpdateUserProfileDto {
  @IsOptional()
  profile_type: string;

  @IsOptional()
  b_firstname: string;

  @IsOptional()
  b_lastname: string;

  @IsOptional()
  b_address: string;

  @IsOptional()
  b_address_2: string;

  @IsOptional()
  b_city: string;

  @IsOptional()
  b_district: string;

  @IsOptional()
  b_ward: string;

  @IsOptional()
  b_country: string;

  @IsOptional()
  b_zipcode: string;

  @IsOptional()
  b_phone: string;

  @IsOptional()
  s_firstname: string;

  @IsOptional()
  s_lastname: string;

  @IsOptional()
  s_address: string;

  @IsOptional()
  s_address_2: string;

  @IsOptional()
  s_city: string;

  @IsOptional()
  s_district: string;

  @IsOptional()
  s_ward: string;

  @IsOptional()
  s_country: string;

  @IsOptional()
  s_zipcode: string;

  @IsOptional()
  s_phone: string;

  @IsOptional()
  s_address_type: string;

  @IsOptional()
  profile_name: string;
}
