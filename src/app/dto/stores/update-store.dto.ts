import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateStoreDto {
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
  @IsDateString()
  start_at: Date;

  @IsOptional()
  @IsDateString()
  end_at: Date;
}
