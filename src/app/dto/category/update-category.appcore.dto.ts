import { IsOptional, IsNotEmpty, IsDateString } from 'class-validator';

export class UpdateCategoryAppcoreDto {
  @IsOptional()
  parent_id: number;

  @IsOptional()
  level: number;

  @IsOptional()
  status: string;

  @IsOptional()
  category: string;

  @IsOptional()
  @IsDateString()
  display_at: Date;
}
