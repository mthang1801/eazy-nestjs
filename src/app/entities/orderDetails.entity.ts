import { formatStandardTimeStamp } from '../../utils/helper';
export class OrderDetailsEntity {
  item_id: number = 0;
  order_id: number = 0;
  order_item_appcore_id: string = null;
  product_id: number = 0;
  product_appcore_id: string = '';
  product_code: string = '';
  product: string = '';
  barcode: string = '';
  price: number = 0;
  amount: number = 0;
  discount: number = 0;
  promotion_type: number = null;
  is_gift_taken: number = null;
  belong_order_detail_id: number = null;
  belong_order_detail_appcore_id: number = null;
  extra: string = '';
  note: string = '';
  status: string = 'A';
  discount_type: number = 1;
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
