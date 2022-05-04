import { formatStandardTimeStamp } from '../../utils/helper';
export class TradeinProgramDetailEntity {
  detail_id: number = 0;
  tradein_id: number = 0;
  product_id: number = 0;
  position: number = null;
  product_appcore_id: number = 0;
  detail_status: string = 'A';
  created_at: string = formatStandardTimeStamp();
  update_at: string = formatStandardTimeStamp();
}
