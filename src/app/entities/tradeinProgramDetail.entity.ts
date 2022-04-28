import { formatStandardTimeStamp } from '../../utils/helper';
export class TradeinProgramDetailEntity {
  detail_id: number = 0;
  tradein_id: number = 0;
  product_id: number = 0;
  product_appcore_id: number = 0;
  product_name: string = '';
  product_code: string = '';
  detail_status: string = 'A';
  collect_price: number = 0;
  created_at: string = formatStandardTimeStamp();
  update_at: string = formatStandardTimeStamp();
}
