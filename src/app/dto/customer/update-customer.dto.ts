import { IsOptional, MaxLength } from 'class-validator';

export class UpdateCustomerDTO {
  @IsOptional()
  @MaxLength(1)
  status: string;

  @IsOptional()
  user_type: string;

  @IsOptional()
  referer: string;

  @IsOptional()
  firstname: string;

  @IsOptional()
  company_id: number;

  @IsOptional()
  store_id: number;

  @IsOptional()
  url: string;

  @IsOptional()
  gender: string;

  @IsOptional()
  datebirth: string;

  @IsOptional()
  lastname: string;

  @IsOptional()
  company: string;

  @IsOptional()
  fax: string;

  @IsOptional()
  birthday: string;

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
  b_county: string;

  @IsOptional()
  b_state: string;

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
  s_county: string;

  @IsOptional()
  s_state: string;

  @IsOptional()
  s_country: string;

  @IsOptional()
  s_zipcode: string;

  @IsOptional()
  s_phone: string;

  @IsOptional()
  profile_name: string;

  @IsOptional()
  loyalty_point: number;
}
