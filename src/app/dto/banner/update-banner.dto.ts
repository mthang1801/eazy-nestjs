import {
  IsOptional,
  IsNotEmpty,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBannerDTO {
  @IsOptional()
  status: string;

  @IsOptional()
  type: string;

  @IsOptional()
  target: string;

  @IsOptional()
  position: number;

  @IsOptional()
  location_id: number;

  @IsOptional()
  target_id: number;

  @IsNotEmpty()
  image_path: string;

  @IsNotEmpty()
  banner: string;

  @IsNotEmpty()
  banner_title: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  url: string;

  @IsOptional()
  url_media: string;
}
