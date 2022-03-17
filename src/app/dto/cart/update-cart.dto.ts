import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested, IsOptional } from 'class-validator';
export class UpdateCartDto {
  @IsNotEmpty()
  user_id: string;

  @ValidateNested()
  @Type(() => CartItem)
  cart_items: CartItem[];
}

class CartItem {
  @IsOptional()
  cart_item_id: number;

  @IsNotEmpty()
  product_id: string;

  @IsNotEmpty()
  amount: string;
}
