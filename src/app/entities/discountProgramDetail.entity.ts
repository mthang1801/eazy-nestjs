import { formatStandardTimeStamp } from 'src/utils/helper';

export class DiscountProgramDetailEntity {
  detail_id: number = 0;
  discount_id: number = 0;
  detail_appcore_id: string = null;
  product_id: number = 0;
  product_appcore_id: string = '';
  status: string = 'A';
  selling_price: number = 0;
  original_price: number = 0;
  discount_amount: number = 0;
  discount_type: number = 1;
  position: number = 9999;
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
