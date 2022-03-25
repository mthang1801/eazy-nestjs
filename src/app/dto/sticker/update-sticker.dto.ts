import { IsOptional } from 'class-validator';
export class UpdateStickerDto {
  @IsOptional()
  sticker_code: string;

  @IsOptional()
  sticker_name: string;

  @IsOptional()
  description: string;

  @IsOptional()
  url_image: string;

  @IsOptional()
  status: string;
}
