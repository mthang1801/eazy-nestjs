import { convertToMySQLDateTime } from 'src/utils/helper';

export class ProductPromotionAccessoryEntity {
  product_id: number = 0;
  accessory_id: number = 0;
  status: string = 'A';
  sale_price: number = 0;
  promotion_price: number = 0;
  sale_price_from: number = 0;
  sale_price_to: number = 0;
  collect_price: number = 0;
  created_at: string = convertToMySQLDateTime();
  updated_at: string = convertToMySQLDateTime();
  created_by: number = 0;
  updated_by: number = 0;
}
