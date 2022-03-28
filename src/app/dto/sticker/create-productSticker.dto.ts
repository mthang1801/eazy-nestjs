import { Type } from 'class-transformer';
import { convertToMySQLDateTime } from '../../../utils/helper';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';

export class CreateProductStickerDto {
  @ArrayNotEmpty()
  product_ids: number[];

  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => ProductStickerItem)
  product_stickers: ProductStickerItem[];
}

export class ProductStickerItem {
  @IsNotEmpty()
  sticker_id: number;

  @IsOptional()
  status: string = 'A';

  @IsNotEmpty()
  @IsIn([1, 2, 3, 4])
  position_id: number; //1: TOP_LEFT, 2: TOP_RIGHT, 3: BOTTOM_LEFT, 4: BOTTOM_RIGHT

  @IsOptional()
  start_at: string = convertToMySQLDateTime();

  @IsOptional()
  end_at: string = convertToMySQLDateTime();
}
