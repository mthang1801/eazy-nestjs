import { IsOptional, IsNotEmpty, ArrayNotEmpty } from 'class-validator';

export class CreateBannerDto {
  @IsOptional()
  status: string;

  @IsOptional()
  type: string;

  @IsOptional()
  target: string;

  @ArrayNotEmpty()
  location_ids: number[];

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

  @IsOptional()
  product_id: string;
}
