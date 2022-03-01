import {
  IsOptional,
  IsNotEmpty,
  MaxLength,
  ValidateNested,
  IsIn,
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
  notes: string;

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
  status: string;
}
