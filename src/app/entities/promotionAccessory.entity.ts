import { formatStandardTimeStamp } from 'src/utils/helper';

export class PromotionAccessoryEntity {
  app_core_id: string = '';
  accessory_code: string = '';
  accessory_name: string = '';
  accessory_type: number = 1;
  description: string = '';
  accessory_status: string = 'A';
  display_at: string = formatStandardTimeStamp();
  end_at: string = null;
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
  created_by: number = 0;
  updated_by: number = 0;
}
