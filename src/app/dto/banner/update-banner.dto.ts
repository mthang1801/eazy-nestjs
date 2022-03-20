import {
  IsOptional,
  IsNotEmpty,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBannerDTO {
  @IsOptional()
  banner: string;

  @IsOptional()
  banner_title: string;

  @IsOptional()
  status: string;

  @IsOptional()
  device_type: string;

  @IsOptional()
  image_path: string;

  @IsOptional()
  description: string;

  @IsOptional()
  url: string;

  @IsOptional()
  url_media: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Display)
  displays: Display[];
}

class Display {
  @IsOptional()
  page_id: number;

  @IsNotEmpty()
  target_id: number;

  @IsNotEmpty()
  location_id: number;

  @IsNotEmpty()
  page_type: number;

  @IsNotEmpty()
  page_url: string;
}
