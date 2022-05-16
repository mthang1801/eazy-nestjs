export class ProductPricesEntity {
  product_id: string = '0';
  price: number = 0;
  buy_price: number = 0;
  collect_price: number = 0;
  whole_price: number = 0;
  percentage_discount: number = 0;
  lower_limit: number = 0;
  list_price: number = 0;
  promotion_price: number = 0;
  promotion_discount_amount: number = 0;
  promotion_discount_type: number = 1;
  promotion_start_at: string = null;
  promotion_end_at: string = null;
}
