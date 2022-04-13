import { formatStandardTimeStamp } from 'src/utils/helper';

export class ProductsEntity {
  product_appcore_id: string = '';
  parent_product_id: null | number = 0;
  parent_product_appcore_id: null | string = '';
  product_code: string = '';
  barcode: string = '';
  product_type: number = 1;
  product_status: string = 'A';
  status: string = 'A';
  company_id: number = 0;
  approved: string = 'Y';
  combo_amount: number = 0;
  thumbnail: string = '';
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
  tax_name: string = '';
  slug: string = '';
  age_verification: string = 'N';
  age_limit: number = 0;
  options_type: string = 'P';
  exceptions_type: string = 'F';
  details_layout: string = '';
  shipping_params: string = '';
  facebook_obj_type: string = '';
  buy_now_url: string = '';
  appcore_combo_setting_id: string = '';
  type: string = '1';
  open_new_tab: string = 'N';
  color: string = '';
  size: string = '';
  warranty_package_id: number = 0;
  free_accessory_id: number = 0;
  promotion_accessory_id: number = 0;
  status_type: string = '1';
  catalog_category_id: number = 3;
  redirect_url: string = '';
  is_installment: string = 'N';
  product_function: number = 4;
  created_at: string = formatStandardTimeStamp();
  display_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
