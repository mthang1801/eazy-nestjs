import {
  IsOptional,
  IsNotEmpty,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBannerDto {
  @IsOptional()
  status: string;

  @IsOptional()
  type: string;

  @IsOptional()
  target: string;

  @IsOptional()
  position: number;

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

  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => Display)
  displays: Display[];
}

class Display {
  @IsNotEmpty()
  target_id: number;

  @IsNotEmpty()
  location_id: number;
}
