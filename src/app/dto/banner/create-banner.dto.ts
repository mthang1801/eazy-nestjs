import {
  IsOptional,
  IsNotEmpty,
  ArrayNotEmpty,
  ValidateNested,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsDateString } from 'class-validator';

export class CreateBannerDto {
  @IsNotEmpty()
  banner: string;

  @IsNotEmpty()
  banner_title: string;

  @IsOptional()
  page_target_id: number;

  @IsOptional()
  page_location_id: number;

  @IsOptional()
  status: string = 'A';

  @IsOptional()
  device_type: string = 'D';

  @IsNotEmpty()
  image_path: string;

  @IsOptional()
  description: string;

  @IsOptional()
  url: string;

  @IsOptional()
  url_media: string;

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
  @IsNotEmpty()
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

  @IsOptional()
  status: string;
}
