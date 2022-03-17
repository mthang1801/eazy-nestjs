import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
export class CreateCartDto {
  @IsNotEmpty()
  user_id: string;

  @ValidateNested()
  @Type(() => CartItem)
  cart_items: CartItem[];
}

class CartItem {
  @IsNotEmpty()
  product_id: string;

  @IsNotEmpty()
  amount: number;
}
