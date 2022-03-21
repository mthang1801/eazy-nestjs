import { Type } from 'class-transformer';
import { IsNotEmpty, Min, ValidateNested } from 'class-validator';
export class CreateCartDto {
  @IsNotEmpty()
  product_id: number;
}
