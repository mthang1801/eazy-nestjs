import { formatStandardTimeStamp } from '../../utils/helper';
export class TradeinProgramEntity {
  tradein_id: number = 0;
  tradein_appcore_id: number = 0;
  name: string = '';
  desc: string = '';
  status: string = 'A';
  discount_rate: number = 0;
  start_at: string = null;
  end_at: string = null;
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
  created_by: number = null;
  updated_by: number = null;
}
