import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreateOrderFEDto {
  @IsNotEmpty()
  s_city: string;

  @IsNotEmpty()
  s_district: string;

  @IsNotEmpty()
  s_ward: string;

  @IsNotEmpty()
  s_addres: string;
}
