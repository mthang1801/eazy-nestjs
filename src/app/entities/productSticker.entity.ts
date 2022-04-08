import { formatStandardTimeStamp } from 'src/utils/helper';

export class ProductStickerEntity {
  sticker_id: number = 0;
  product_id: number = 0;
  status: string = 'A';
  position_id: number = 1;
  start_at: string = '';
  end_at: string = '';
}
