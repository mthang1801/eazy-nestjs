import { formatStandardTimeStamp } from 'src/utils/helper';

export class CityEntity {
  id: number = 0;
  city_name: string = '';
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
