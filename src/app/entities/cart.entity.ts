import { convertToMySQLDateTime } from 'src/utils/helper';

export class CartEntity {
  cart_id: number = 0;
  user_id: string = '';
  created_at: string = convertToMySQLDateTime();
  updated_at: string = convertToMySQLDateTime();
}
