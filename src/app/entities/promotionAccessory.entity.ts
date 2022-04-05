import { convertToMySQLDateTime } from 'src/utils/helper';

export class PromotionAccessoryEntity {
  app_core_id: string = '';
  accessory_code: string = '';
  accessory_name: string = '';
  accessory_type: number = 1;
  description: string = '';
  accessory_status: string = 'A';
  display_at: string = convertToMySQLDateTime();
  end_at: string = '';
  created_at: string = convertToMySQLDateTime();
  updated_at: string = convertToMySQLDateTime();
  created_by: number = 0;
  updated_by: number = 0;
}
