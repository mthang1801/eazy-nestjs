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
  @IsDateString()
  created_at: string;
}
