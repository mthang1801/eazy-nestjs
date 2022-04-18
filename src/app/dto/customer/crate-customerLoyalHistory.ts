import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateCustomerLoyalHistoryDto {
  @IsNotEmpty()
  point: number;

  @IsOptional()
  type: number;

  @IsOptional()
  by_type: string;

  @IsOptional()
  ref_id: string;

  @IsOptional()
  order_appcore_id: number;

  @IsOptional()
  @IsDateString()
  created_at: string;
}
