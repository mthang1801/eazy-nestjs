import { IsOptional, IsNotEmpty } from 'class-validator';

export class bannerCreateDTO {
  @IsOptional()
  status: string;
  @IsOptional()
  type: string;
  @IsOptional()
  target: string;
  @IsOptional()
  localization: string;
  @IsOptional()
  position: number;
  @IsNotEmpty()
  image_path: string;
  @IsNotEmpty()
  banner: string;
  @IsOptional()
  description: string;
  @IsOptional()
  url: string;
  @IsOptional()
  image_x: number;
  @IsOptional()
  image_y: number;
  @IsOptional()
  is_high_res: string;
}
