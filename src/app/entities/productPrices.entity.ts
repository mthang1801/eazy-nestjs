export class ProductPricesEntity {
  product_id: string = '0';
  price: number = 0;
  buy_price: number = 0;
  collect_price: number = 0;
  whole_price: number = 0;
  percentage_discount: number = 0;
  lower_limit: number = 0;
  list_price: number = 0;
  selling_price_program: number = 0;
  original_price_program: number = 0;
  discount_amount_program: number = 0;
  status_program: string = 'A';
  discount_type: number = 1;
  time_start_at: string = null;
  time_end_at: string = null;
}
