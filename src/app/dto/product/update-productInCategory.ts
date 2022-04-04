import { IsOptional } from 'class-validator';

export class UpdateProductsInCategory {
  @IsOptional()
  removed_products: number[];

  @IsOptional()
  inserted_products: number[];
}
