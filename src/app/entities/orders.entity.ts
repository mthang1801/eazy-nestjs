import { convertToMySQLDateTime } from 'src/utils/helper';
import { v4 as uuid } from 'uuid';
import { OrderStatus } from '../../database/enums/status.enum';
export class OrderEntity {
  order_id: number = 0;
  origin_order_id: null | number = 0;
  is_parent_order: string = 'N';
  parent_order_id: number = 0;
  company_id: number = 0;
  issuer_id: number = 0;
  user_id: number = 0;
  store_id: number = 0;
  total: number = 0;
  subtotal: number = 0;
  discount: number = 0;
  discount_type: number = 1;
  subtotal_discount: number = 0;
  payment_surcharge: number = 0;
  shipping_ids: string = '';
  warranty_note: string = '';
  shipping_cost: number = 0;
  disposit_amount: number = 0;
  status: string = OrderStatus.Failed;
  notes: string = '';
  gender: number = 0;
  details: string = '';
  promotions: string = '';
  promotion_ids: string = '';
  firstname: string = '';
  lastname: string = '';
  company: string = '';
  b_firstname: string = '';
  b_lastname: string = '';
  b_address: string = '';
  b_address_2: string = '';
  b_city: string = '';
  b_district: string = '';
  b_ward: string = '';
  b_county: string = '';
  b_state: string = '';
  b_country: string = '';
  b_zipcode: string = '';
  b_phone: string = '';
  is_sent_customer_address: number = 1;
  s_firstname: string = '';
  s_lastname: string = '';
  s_address: string = '';
  s_address_2: string = '';
  s_city: string = '';
  s_district: string = '';
  s_ward: string = '';
  s_county: string = '';
  s_state: string = '';
  s_country: string = '';
  s_zipcode: string = '';
  s_phone: string = '';
  s_address_type: string = '';
  phone: string = '';
  fax: string = '';
  url: string = '';
  email: string = '';
  id_card: number = 0;
  cash_account_id: number = 0;
  transfer_amount: number = 0;
  transfer_account_id: number = 0;
  transfer_ref_code: null | string = '';
  credit_amount: number = 0;
  credit_code: null | string = '';
  credit_card_no: null | string = '';
  credit_fee_account_id: number = 0;
  installed_money_amount: number = 0;
  installed_money_code: string = '';
  installed_money_account_id: number = 0;
  pay_credit_type: null | number = 0;
  payment_id: number = 0;
  payment_status: number = 1;
  tax_exempt: string = '';
  lang_code: string = '';
  ip_address: string = '';
  repaid: number = 0;
  validation_code: string = '';
  localization_id: number = 0;
  utm_source: number = 0;
  ref_order_id: string = uuid().replace(/-/g, '');
  created_date: string = convertToMySQLDateTime();
  updated_date: string = convertToMySQLDateTime();
}
