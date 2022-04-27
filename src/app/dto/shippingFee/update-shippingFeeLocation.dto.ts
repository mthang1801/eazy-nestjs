import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
export class UpdateShippingFeeLocationDto {
  @ValidateNested()
  @Type(() => ShippingFee)
  shippingFees: ShippingFee[];
}

class ShippingFee {
  @IsOptional()
  shipping_fee_location_id: number;

  @IsOptional()
  city_id: string;

  @IsOptional()
  value_fee: number;

  @IsOptional()
  fee_location_status: string = 'A';
}
