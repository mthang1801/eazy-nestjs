import { IsOptional } from 'class-validator';

export class UpdateProductsInCategory {
  @IsOptional()
  deleted_products: number[];

  @IsOptional()
  inserted_products: number[];
}
