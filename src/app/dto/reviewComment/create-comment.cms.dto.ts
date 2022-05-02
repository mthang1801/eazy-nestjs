import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCommentCMSDto {
  @IsNotEmpty()
  comment: string;

  @IsOptional()
  parent_item_id: number = null;

  @IsOptional()
  images: string[];

  @IsOptional()
  type: number;

  @IsOptional()
  reply_item_id: number;
}
