export class OrderDetailsEntity {
  item_id: number = 0;
  order_id: number = 0;
  product_id: number = 0;
  product_code: string = '';
  price: number = 0;
  amount: number = 0;
  discount_type: number = 0;
  discount_amount: number = 0;
  product_type: number = 0;
  imei_code: string = '';
  repurchase_price: number = 0;
  is_gift_taken: null;
  belong_order_detail_id: null;
  extra: string = '';
  note: string = '';
}
