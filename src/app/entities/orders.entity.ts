export class OrderEntity {
  order_id: number = 0;
  is_parent_order: string = 'N';
  parent_order_id: number = 0;
  company_id: number = 0;
  issuer_id: string = '';
  user_id: number = 0;
  total: number = 0;
  subtotal: number = 0;
  discount: number = 0;
  subtotal_discount: number = 0;
  payment_surcharge: number = 0;
  shipping_ids: string = '';
  shipping_cost: number = 0;
  timestamp: Date = new Date();
  status: string = 'O';
  notes: string = '';
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
  b_county: string = '';
  b_state: string = '';
  b_country: string = '';
  b_zipcode: string = '';
  b_phone: string = '';
  s_firstname: string = '';
  s_lastname: string = '';
  s_address: string = '';
  s_address_2: string = '';
  s_city: string = '';
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
  payment_id: number = 0;
  tax_exempt: string = '';
  lang_code: string = '';
  ip_address: string = '';
  repaid: number = 0;
  validation_code: string = '';
  localization_id: number = 0;
  profile_id: number = 0;
}
