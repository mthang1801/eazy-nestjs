import { formatStandardTimeStamp } from '../../utils/helper';
export class ShippingFeeEntity {
  shipping_fee_id: number = 0;
  shipping_name: string = '';
  description: string = '';
  status: string = 'A';
  min_value: number = 0;
  max_value: number = 0;
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
  created_by: number = 0;
  updated_by: number = 0;
}
