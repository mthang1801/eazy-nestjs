import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateOrderSelfTransportDto {
  @IsNotEmpty()
  b_lastname: string;

  @IsNotEmpty()
  b_phone: string;

  @IsOptional()
  email: string;

  @IsNotEmpty()
  store_id: number;
}
