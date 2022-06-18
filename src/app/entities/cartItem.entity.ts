export class CartItemEntity {
  cart_item_id: number = 0;
  cart_id: number = 0;
  product_id: string = '';
  amount: number = 0;
  belong_order_detail_appcore_id: string = null;
  belong_order_detail_id: number = null;
  if_gift_taken: number = null;
}
