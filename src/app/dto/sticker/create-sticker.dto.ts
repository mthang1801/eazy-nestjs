import { IsNotEmpty, IsOptional } from 'class-validator';
export class CreateStickerDto {
  @IsNotEmpty()
  sticker_code: string;

  @IsNotEmpty()
  sticker_name: string;

  @IsOptional()
  description: string;

  @IsNotEmpty()
  url_image: string;

  @IsOptional()
  sticker_status: string;
}
