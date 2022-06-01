import {
  formatStandardTimeStamp,
  generateRandomString,
} from 'src/utils/helper';

export class OrderEntity {
  order_code: number = null;
  is_parent_order: string = 'N';
  parent_order_id: number = 0;
  company_id: number = 0;
  issuer_id: number = 0;
  user_id: number = 0;
  store_id: number = 0;
  total: number = 0;
  subtotal: number = 0;
  coupon_programing_id: number = 0;
  coupon_code: string = '';
  discount: number = 0;
  discount_type: number = 1;
  order_type: number = 1;
  subtotal_discount: number = 0;
  payment_surcharge: number = 0;
  shipping_id: string = '';
  warranty_note: string = '';
  shipping_cost: number = 0;
  shipping_service_id: number = 0;
  disposit_amount: number = 0;
  status: number = 1;
  notes: string = '';
  gender: string = '0';
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
  birthday: string = null;
  id_card: number = 0;
  cash_account_id: number = 0;
  transfer_no: number = 0;
  transfer_bank: string = '';
  transfer_amount: number = 0;
  transfer_account_id: number = 0;
  transfer_ref_code: null | string = '';
  credit_account_id: number = 0;
  credit_fee_account_id: number = 0;
  credit_amount: number = 0;
  credit_code: null | string = '';
  credit_card_no: null | string = '';
  installed_money_amount: number = 0;
  installed_tenor: number = 0;
  installed_prepaid_amount: number = 0;
  installed_money_code: string = '';
  installed_money_account_id: number = 0;
  pay_credit_type: null | number = 1;
  payment_id: number = 0;
  payment_status: number = 1;
  tax_exempt: string = '';
  lang_code: string = '';
  ip_address: string = '';
  prepaid: number = 0;
  repaid: number = 0;
  validation_code: string = '';
  localization_id: number = 0;
  utm_source: number = 0;
  transfer_code: string = '';
  other_fees: number = 0;
  user_appcore_id: number = 0;
  is_sync: string = 'N';
  payment_date: string = null;
  installment_promotion_code: string = '';
  installment_interest_rate: string = '';
  installment_interest_rate_code: string = '';
  installment_tenor_code: string = '';
  reason_fail: string = '';
  ref_order_id: string = generateRandomString();
  created_date: string = formatStandardTimeStamp();
  updated_date: string = formatStandardTimeStamp();
}
