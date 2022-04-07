import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateProductPromotionAccessoryDto {
  @IsNotEmpty()
  type: number;

  @IsOptional()
  removed_products: [];

  @IsOptional()
  inserted_products: [];
}
