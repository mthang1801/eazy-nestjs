import { convertToMySQLDateTime } from 'src/utils/helper';

export class CityEntity {
  id: number = 0;
  city_name: string = '';
  created_at: string = convertToMySQLDateTime();
  updated_at: string = convertToMySQLDateTime();
}
