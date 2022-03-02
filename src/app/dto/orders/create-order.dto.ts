import {
  IsOptional,
  IsNotEmpty,
  MaxLength,
  ValidateNested,
  IsIn,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class Product {
  @IsNotEmpty()
  product_id: string;

  @IsNotEmpty()
  amount: number;
  @IsOptional()
  extra: string;
}
export class OrderCreateDTO {
  @IsNotEmpty()
  b_firstname: string;

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

  @IsOptional()
  notes: string; //Ghi chú khách hàng

  @IsOptional()
  store_id: number;

  @IsOptional()
  @IsIn(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'])
  //Kênh đặt
  // 1. ZALO
  // 2. YOUTUBE
  // 3. ORDER ONLINE
  // 4. HOTLINE
  // 5. ZALO
  // 6. FACEBOOK
  // 7. INSTAGRAM
  // 8. WEBSITE DDV
  // 9. E-COM
  // 10. TRỰC TIẾP – CỪA HÀNG
  // 11. NGUỒN KHÁC
  utm_source: string;

  @IsOptional()
  order_type: number = 4; //Loại đơn: 1.Mua tại quầy,2. Đặt trước, 3. Chuyển hàng, 4 Trực tuyến

  @IsOptional()
  status: string; //Trạng thái đơn hàng

  @IsOptional()
  warranty_note: string; //Ghi chú bảo hành

  @ArrayNotEmpty()
  products: ProductOrder[];

  @IsOptional()
  shipping_cost: number = 0; //Phí trả khách hàng phải trả

  @IsOptional()
  shipping_fee: number = 0; //Phí ship của hãng vận chuyển

  @IsOptional()
  internal_note: string = ''; //Nhân viên nội bộ note

  @IsOptional()
  disposit_amount: number = 0; //tiền cọc

  @IsOptional()
  transfer_amount: number = 0; //Tiền chuyển khoản

  @IsOptional()
  transfer_account_id: number = 0; //Mã tiền chuyển khoản\

  @IsOptional()
  transfer_ref_code: string = ''; //Ma tham chiếu

  @IsOptional()
  credit_amount: number = 0; //Tiền quẹt thẻ

  @IsOptional()
  credit_code: null | string;

  @IsOptional()
  credit_card_no: null | string;

  @IsOptional()
  pay_credit_type: null | number;

  @IsOptional()
  installed_money_amount: number = 0;

  @IsOptional()
  installed_money_code: string = '';

  @IsOptional()
  installed_money_account_id: number = 0;
}

class ProductOrder {
  @IsNotEmpty()
  product_id: string;

  @IsNotEmpty()
  price: number;

  @IsNotEmpty()
  amount: number;
}
