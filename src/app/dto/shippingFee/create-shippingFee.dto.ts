import { IsNotEmpty, IsOptional } from 'class-validator';
export class CreateShippingFeeDto {
  @IsNotEmpty()
  shipping_name: string;

  @IsOptional()
  description: string;

  @IsOptional()
  status: string = 'A';

  @IsOptional()
  min_value: number;

  @IsOptional()
  max_value: number;
}
