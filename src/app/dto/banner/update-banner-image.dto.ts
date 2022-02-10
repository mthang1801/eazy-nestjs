import { IsOptional, IsNotEmpty } from 'class-validator';

export class updateBannerImageDTO {
  @IsOptional()
  position: number;
  @IsNotEmpty()
  image_path: string;

  @IsOptional()
  image_x: number;
  @IsOptional()
  image_y: number;
  @IsOptional()
  is_high_res: string;
}
