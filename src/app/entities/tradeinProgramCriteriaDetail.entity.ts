import { formatStandardTimeStamp } from '../../utils/helper';
export class TradeinProgramCriteriaDetailEntity {
  criteria_id: number = 0;
  criteria_detail_id: number = 0;
  criteria_detail_name: string = '';
  accessory_appcore_id: number = null;
  accessory_category_id: number = 0;
  criteria_detail_description: string = '';
  operator_type: string = 'A';
  value: number = 0;
  criteria_type: number = 1;
}
