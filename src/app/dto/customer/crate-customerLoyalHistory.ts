import { IsNotEmpty, IsOptional } from 'class-validator';
export class CreateCustomerLoyalHistoryDto {
  @IsNotEmpty()
  point: number;

  @IsOptional()
  type: string;

  @IsOptional()
  by_type: string;

  @IsOptional()
  ref_id: number;

  @IsOptional()
  created_at: string;
}
