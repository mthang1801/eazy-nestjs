import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsOptional,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { generateRandomString } from 'src/utils/helper';

export class CreateOrderAppcoreDto {
  @IsOptional()
  user_appcore_id: number;

  @IsOptional()
  b_firstname: string;

  @IsOptional()
  b_lastname: string;

  @IsOptional()
  b_city: string;

  @IsOptional()
  b_district: string;

  @IsOptional()
  b_ward: string;

  @IsOptional()
  b_address: string;

  @IsOptional()
  b_phone: string;

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
  total: number = 0;

  @IsOptional()
  status: number = 1;

  @IsOptional()
  payment_status: number = 1;

  @IsOptional()
  warranty_note: string; //Ghi chú bảo hành

  @ArrayNotEmpty()
  @Type(() => ProductOrder)
  @ValidateNested()
  order_items: ProductOrder[];

  @IsOptional()
  shipping_id: string = ''; //Mã vận đơn

  @IsOptional()
  shipping_service_id: number; //Mã dịch vụ vận chuyển

  @IsOptional()
  shipping_cost: number = 0; //Phí trả khách hàng phải trả

  @IsOptional()
  shipping_fee: number = 0; //Phí ship của hãng vận chuyển

  @IsOptional()
  cash_account_id: number = 0; //Mã tài khoản tiền mặt

  @IsOptional()
  internal_note: string = ''; //Nhân viên nội bộ note

  @IsOptional()
  discount_type: number = 1;

  @IsOptional()
  discount: number = 0;

  @IsOptional()
  disposit_amount: number = 0; //tiền cọc

  @IsOptional()
  transfer_account_id: number = 0; //Mã tiền chuyển khoản

  @IsOptional()
  transfer_amount: number = 0; //Tiền chuyển khoản

  @IsOptional()
  transfer_ref_code: string = ''; //Ma tham chiếu

  @IsOptional()
  transfer_no: number = 0;

  @IsOptional()
  transfer_bank: string = '';

  @IsOptional()
  credit_account_id: null | number = 0;

  @IsOptional()
  credit_amount: number = 0; //Tiền quẹt thẻ

  @IsOptional()
  credit_code: null | string;

  @IsOptional()
  credit_card_no: null | string;

  @IsOptional()
  pay_credit_type: null | number = 1;

  @IsOptional()
  credit_fee_account_id: null | number = 0;

  @IsOptional()
  installed_money_amount: number = 0;

  @IsOptional()
  installed_money_code: string = '';

  @IsOptional()
  installed_money_account_id: number = 0;

  @IsOptional()
  id_card: string = '';

  @IsOptional()
  coupon_code: string = '';

  @IsOptional()
  ref_order_id: string = generateRandomString();

  @IsOptional()
  email: string = '';

  @IsOptional()
  is_sent_customer_address: number = 1;

  @IsOptional()
  s_firstname: string = '';

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
  transfer_code: string = ''; // Mã vận đơn

  @IsNotEmpty()
  order_code: number = 0;

  @IsOptional()
  other_fees: number = 0;

  @IsOptional()
  installment_promotion_code: string = '';

  @IsOptional()
  installment_interest_rate: string = '';

  @IsOptional()
  installment_interest_rate_code: string = '';

  @IsOptional()
  installment_tenor_code: string = '';
}

class ProductOrder {
  @IsNotEmpty()
  order_item_appcore_id: string;

  @IsOptional()
  product_id: string;

  @IsOptional()
  product_appcore_id: string;

  @IsOptional()
  price: number;

  @IsOptional()
  amount: number = 1;

  @IsOptional()
  product_code: string;

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
  discount: number = 0;
}
