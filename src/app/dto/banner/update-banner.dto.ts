import {
  IsOptional,
  IsNotEmpty,
  ArrayNotEmpty,
  ValidateNested,
  IsDate,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBannerDTO {
  @IsOptional()
  banner: string;

  @IsOptional()
  banner_title: string;

  @IsOptional()
  page_target_id: number;

  @IsOptional()
  page_location_id: number;

  @IsOptional()
  status: string = 'A';

  @IsOptional()
  device_type: string = 'D';

  @IsOptional()
  image_path: string;

  @IsOptional()
  description: string;

  @IsOptional()
  url: string;

  @IsOptional()
  url_media: string;

  @IsOptional()
  auto_slide: string;

  @IsOptional()
  slide_per_page: number;

  @IsOptional()
  @IsDateString()
  start_at: string;

  @IsOptional()
  @IsDateString()
  end_at: string;

  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => BannerItem)
  banner_items: BannerItem[];
}

class BannerItem {
  @IsOptional()
  title: number;

  @IsOptional()
  position: number;

  @IsOptional()
  start_at: string;

  @IsOptional()
  end_at: string;

  @IsOptional()
  link_target_url: string;

  @IsOptional()
  image_url: string;
}
