import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateStoreDto {
  @IsNotEmpty()
  store_location_id: number;

  @IsNotEmpty()
  store_name: string;

  @IsNotEmpty()
  pickup_address: string;

  @IsOptional()
  pickup_phone: string;

  @IsNotEmpty()
  city_id: number;

  @IsNotEmpty()
  district_id: number;

  @IsOptional()
  ward_id: number;

  @IsOptional()
  longitude: number;

  @IsOptional()
  latitude: number;

  @IsOptional()
  open_at: string;

  @IsOptional()
  close_at: string;

  @IsOptional()
  status: string = 'A';
}
