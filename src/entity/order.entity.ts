import { formatStandardTimeStamp } from '../utils/helper';
export class OrderEntity {
  order_id: number = 0;
  sub_total_price: number = 0;
  other_fees: number = 0;
  total_price: number = 0;
  status: string = '';
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
