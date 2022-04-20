import { IsNotEmpty, IsOptional } from 'class-validator';
export class CreateShippingFeeLocationDto {
  @IsNotEmpty()
  city_id: string;

  @IsOptional()
  value_fee: number;

  @IsOptional()
  fee_location_status: string = 'A';
}
