import {
  IsOptional,
  IsNotEmpty,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBannerDto {
  @IsNotEmpty()
  banner: string;

  @IsNotEmpty()
  banner_title: string;

  @IsOptional()
  status: string = 'A';

  @IsOptional()
  device_type: string = 'D';

  @IsNotEmpty()
  image_path: string;

  @IsOptional()
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

  @IsNotEmpty()
  page_type: number;

  @IsNotEmpty()
  page_url: string;
}
