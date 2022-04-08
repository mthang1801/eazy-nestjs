import { formatStandardTimeStamp } from '../../utils/helper';
export class WardEntity {
  id: number = 0;
  ward_name: string = '';
  district_id: number = 0;
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
