import { formatStandardTimeStamp } from 'src/utils/helper';

export class DistrictEntity {
  id: number = 0;
  district_name: string = '';
  city_id: number = 0;
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
