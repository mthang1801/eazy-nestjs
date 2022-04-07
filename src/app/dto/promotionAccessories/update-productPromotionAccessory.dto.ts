import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateProductPromotionAccessoryDto {
  @IsOptional()
  removed_products: [];

  @IsOptional()
  inserted_products: [];
}
