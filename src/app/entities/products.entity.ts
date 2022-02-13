export class ProductsEntity {
  product_id: number = 0;
  product_code: string = '';
  product_type: string = 'P';
  status: string = 'A';
  company_id: number = 0;
  approved: string = 'Y';
  list_price: number = 0;
  amount: number = 0;
  weight: number = 0;
  length: number = 0;
  width: number = 0;
  height: number = 0;
  shipping_freight: number = 0;
  low_avail_limit: number = 0;
  usergroup_ids: string = '';
  is_edp: string = 'N';
  edp_shipping: string = 'N';
  unlimited_download: string = 'N';
  tracking: string = 'B';
  free_shipping: string = 'N';
  zero_price_action: string = 'R';
  is_pbp: string = 'N';
  is_op: string = 'N';
  is_oper: string = 'N';
  is_returnable: string = 'Y';
  return_period: number = 10;
  avail_since: number = 0;
  out_of_stock_actions: string = 'N';
  localization: string = ' ';
  min_qty: number = 0;
  max_qty: number = 0;
  qty_step: number = 0;
  list_qty_count: number = 0;
  tax_ids: string = '';
  age_verification: string = 'N';
  age_limit: number = 0;
  options_type: string = 'P';
  exceptions_type: string = 'F';
  details_layout: string = '';
  shipping_params: string = '';
  facebook_obj_type: string = '';
  parent_product_id: number = 0;
  buy_now_url: string = '';
  created_at: Date = new Date();
  display_at: Date = new Date();
}
