import { formatStandardTimeStamp } from 'src/utils/helper';

export class CartEntity {
  cart_id: number = 0;
  user_id: string = '';
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
