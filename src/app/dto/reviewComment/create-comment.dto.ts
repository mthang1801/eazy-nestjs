import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  comment: string;

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
