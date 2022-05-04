import { formatStandardTimeStamp } from '../../utils/helper';
export class TradeinProgramCriteriaEntity {
  criteria_id: number = 0;
  tradein_id: number = 0;
  criteria_name: string = '';
  position: number = null;
  criteria_status: string = 'A';
  criteria_style: number = 1;
  criteria_value: number = 0;
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
