import { IsNotEmpty } from 'class-validator';

export class CreateProductStoreDto {
  @IsNotEmpty()
  product_id: string;

  @IsNotEmpty()
  store_location_id: number;

  @IsNotEmpty()
  amount: number;
}
