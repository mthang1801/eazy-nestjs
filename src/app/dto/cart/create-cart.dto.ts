import { IsNotEmpty } from 'class-validator';
export class CreateCartDto {
  @IsNotEmpty()
  user_id: string;

  @IsNotEmpty()
  product_id: string;

  @IsNotEmpty()
  amount: string;
}
