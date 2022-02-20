import { Type } from 'class-transformer';
import { IsOptional, IsNotEmpty, ValidateNested } from 'class-validator';

export class UpdateImageDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ImageDto)
  images: ImageDto[];
}

class ImageDto {
  @IsNotEmpty({ message: 'image_path là bắt buộc' })
  image_path: string = '';
  @IsOptional()
  image_x: number = 0;
  @IsOptional()
  image_y: number = 0;
  @IsOptional()
  is_high_res: string = 'N';
}
