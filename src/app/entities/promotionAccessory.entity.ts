import { formatStandardTimeStamp } from 'src/utils/helper';

export class PromotionAccessoryEntity {
  app_core_id: string = '';
  accessory_code: string = '';
  accessory_name: string = '';
  accessory_type: number = 1;
  description: string = '';
  accessory_status: string = 'A';
  used: number = 0;
  max_use: number = null;
  display_at: string = null;
  end_at: string = null;
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
  created_by: number = 0;
  updated_by: number = 0;
  time_start_at: string = null;
  time_end_at: string = null;
}
