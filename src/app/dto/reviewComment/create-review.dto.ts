import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsOptional()
  comment: string;

  @IsOptional()
  @IsIn([1, 2, 3, 4, 5])
  point: number;

  @IsOptional()
  parent_item_id: number;

  @IsOptional()
  phone: string;

  @IsOptional()
  email: string;

  @IsOptional()
  fullname: string;

  @IsOptional()
  images: string[];
}
