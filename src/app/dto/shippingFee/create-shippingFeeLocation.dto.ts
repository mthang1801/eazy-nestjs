import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
export class CreateShippingFeeLocationDto {
  @ValidateNested()
  @Type(() => ShippingFee)
  shippingFees: ShippingFee[];
}

class ShippingFee {
  @IsOptional()
  city_id: string;

  @IsOptional()
  value_fee: number;

  @IsOptional()
  fee_location_status: string = 'A';
}
