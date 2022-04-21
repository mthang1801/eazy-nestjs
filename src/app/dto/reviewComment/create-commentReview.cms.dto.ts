import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCommentReviewCMSDto {
  @IsNotEmpty()
  comment: string;

  @IsOptional()
  parent_item_id: number;

  @IsOptional()
  images: string[];

  @IsOptional()
  type: number;
}
