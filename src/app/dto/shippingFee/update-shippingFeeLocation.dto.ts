import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
export class UpdateShippingFeeLocationDto {
  @IsOptional()
  value_fee: number;

  @IsOptional()
  fee_location_status: string = 'A';
}
