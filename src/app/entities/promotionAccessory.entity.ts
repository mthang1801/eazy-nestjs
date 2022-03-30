import { convertToMySQLDateTime } from 'src/utils/helper';

export class PromotionAccessoryEntity {
  accessory_code: string = '';
  accessory_name: string = '';
  accessory_type: number = 0;
  description: string = '';
  accessory_status: string = 'A';
  created_at: string = convertToMySQLDateTime();
  updated_at: string = convertToMySQLDateTime();
  created_by: number = 0;
  updated_by: number = 0;
}
