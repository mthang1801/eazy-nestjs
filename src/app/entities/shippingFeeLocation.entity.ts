import { formatStandardTimeStamp } from '../../utils/helper';
export class ShippingFeeLocationEntity {
  shipping_fee_location_id: number = 0;
  shipping_fee_id: number = 0;
  city_id: number = 0;
  city_name: string = '';
  value_fee: number = 0;
  fee_location_status: string = 'A';
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
