import {
  ArrayNotEmpty,
  IsDateString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class UpdatePromotionAccessoryDto {
  @IsNotEmpty()
  accessory_code: string;

  @IsNotEmpty()
  accessory_name: string;

  @ArrayNotEmpty()
  product_ids: number[];

  @IsOptional()
  status: string = 'A';

  @IsOptional()
  @IsDateString()
  display_at: string;
}
