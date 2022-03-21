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
  @Type(() => BannerItem)
  banner_items: BannerItem[];
}

class BannerItem {
  @IsNotEmpty()
  location_id: number;

  @IsOptional()
  page_type: number;

  @IsOptional()
  page_url: string;
}
