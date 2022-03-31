import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';

export class UpdateProductStickerDto {
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => ProductStickerItem)
  product_stickers: ProductStickerItem[];
}

export class ProductStickerItem {
  @IsNotEmpty()
  sticker_id: number;

  @IsOptional()
  status: string;

  @IsNotEmpty()
  @IsIn([1, 2, 3, 4])
  position_id: number; //1: TOP_LEFT, 2: TOP_RIGHT, 3: BOTTOM_LEFT, 4: BOTTOM_RIGHT

  @IsNotEmpty()
  start_at: string;

  @IsNotEmpty()
  end_at: string;
}
