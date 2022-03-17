import { IsNotEmpty } from 'class-validator';
export class UpdateCustomerLoyalty {
  @IsNotEmpty()
  loyalty_point: number;
}
