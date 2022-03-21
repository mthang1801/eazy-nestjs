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
  @Type(() => BannerItem)
  banner_items: BannerItem[];
}

class BannerItem {
  @IsOptional()
  banner_item_id: number;

  @IsOptional()
  location_id: number;

  @IsOptional()
  page_type: number;

  @IsOptional()
  page_url: string;
}
