import { convertToMySQLDateTime } from '../../utils/helper';
export class WardEntity {
  id: number = 0;
  ward_name: string = '';
  district_id: number = 0;
  created_at: string = convertToMySQLDateTime();
  updated_at: string = convertToMySQLDateTime();
}
