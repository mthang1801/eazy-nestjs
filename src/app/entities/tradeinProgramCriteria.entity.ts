import { formatStandardTimeStamp } from '../../utils/helper';
export class TradeinProgramCriteriaEntity {
  criteria_id: number = 0;
  tradein_id: number = 0;
  criteria_name: string = '';
  position: number = null;
  criteria_style: number = null;
  criteria_value: string = '';
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
