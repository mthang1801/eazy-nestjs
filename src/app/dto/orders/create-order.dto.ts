import {
  IsOptional,
  IsNotEmpty,
  MaxLength,
  ValidateNested,
  IsIn,
  ArrayNotEmpty,
} from 'class-validator';

import { generateRandomString } from 'src/utils/helper';
export class CreateOrderDto {
  @IsOptional()
  user_id: number;

  @IsNotEmpty()
  b_lastname: string;

  @IsNotEmpty()
  b_city: string;

  @IsNotEmpty()
  b_district: string;

  @IsNotEmpty()
  b_ward: string;

  @IsNotEmpty()
  b_address: string;

  @IsNotEmpty()
  b_phone: string;

  @IsOptional()
  type: string;

  @IsOptional()
  notes: string; //Ghi chú khách hàng

  @IsOptional()
  store_id: number;

  @IsOptional()
  employee_id: number;

  @IsOptional()
  utm_source: number;

  @IsOptional()
  order_type: number = 4; //Loại đơn: 1.Mua tại quầy,2. Đặt trước, 3. Chuyển hàng, 4 Trực tuyến

  @IsOptional()
  status: number = 1; //Trạng thái đơn hàng 0. Chưa hoạt động, 1. Mới

  @IsOptional()
  payment_status: number = 1;

  @IsOptional()
  warranty_note: string; //Ghi chú bảo hành

  @ArrayNotEmpty()
  order_items: ProductOrder[];

  @IsOptional()
  shipping_id: string = ''; //Mã vận đơn

  @IsOptional()
  shipping_service_id: number = 0; //Mã vận đơn

  @IsOptional()
  shipping_cost: number = 0; //Phí trả khách hàng phải trả

  @IsOptional()
  shipping_fee: number = 0; //Phí ship của hãng vận chuyển

  @IsOptional()
  cash_account_id: number = 0;

  @IsOptional()
  internal_note: string = ''; //Nhân viên nội bộ note

  @IsOptional()
  discount_type: number = 1;

  @IsOptional()
  disposit_amount: number = 0; //tiền cọc

  @IsOptional()
  transfer_amount: number = 0; //Tiền chuyển khoản

  @IsOptional()
  transfer_account_id: number = 0; //Mã tiền chuyển khoản

  @IsOptional()
  transfer_ref_code: string = ''; //Ma tham chiếu

  @IsOptional()
  credit_account_id: null | number = 0;

  @IsOptional()
  credit_amount: number = 0; //Tiền quẹt thẻ

  @IsOptional()
  credit_fee_account_id: null | number = 0;

  @IsOptional()
  credit_code: null | string;

  @IsOptional()
  credit_card_no: null | string;

  @IsOptional()
  pay_credit_type: null | number = 1;

  @IsOptional()
  installed_money_amount: number = 0;

  @IsOptional()
  installed_money_code: string = '';

  @IsOptional()
  installed_money_account_id: number = 0;

  @IsOptional()
  id_card: string = '';

  @IsOptional()
  discount: number = 0;

  @IsOptional()
  coupon_programing_id: number = 0;

  @IsOptional()
  coupon_code: string = '';

  @IsOptional()
  ref_order_id: string = generateRandomString();

  @IsOptional()
  email: string = '';

  @IsOptional()
  is_sent_customer_address: number = 1;

  @IsOptional()
  s_lastname: string = '';

  @IsOptional()
  s_city: string = '';

  @IsOptional()
  s_district: string = '';

  @IsOptional()
  s_ward: string = '';

  @IsOptional()
  s_address: string = '';

  @IsOptional()
  s_phone: string = '';

  @IsOptional()
  order_code: number = 0;

  @IsOptional()
  transfer_code: string = '';

  @IsOptional()
  other_fees: number = 0;

  @IsOptional()
  transfer_no: number = 0;

  @IsOptional()
  transfer_bank: string = '';

  @IsOptional()
  total: number = 0;
}

class ProductOrder {
  @IsOptional()
  order_item_appcore_id: string;

  @IsOptional()
  product_id: string;

  @IsOptional()
  price: number;

  @IsOptional()
  amount: number = 1;

  @IsOptional()
  product_appcore_id: string = '';

  @IsOptional()
  is_gift_taken: null | number = 0;

  @IsOptional()
  belong_order_detail_id: null | string = '';

  @IsOptional()
  note: string = '';

  @IsOptional()
  extra: string = '';

  @IsOptional()
  status: string = 'A';

  @IsOptional()
  product_code: string;
}
