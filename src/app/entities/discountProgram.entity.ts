import { formatStandardTimeStamp } from 'src/utils/helper';

export class DiscountProgramEntity {
  discount_id: number = 0;
  appcore_id: string = '';
  discount_code: string = '';
  discount_name: string = '';
  description: string = '';
  status: string = 'A';
  used: number = 0;
  max_use: number = null;
  priority: number = null;
  start_at: string = null;
  end_at: string = null;
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
  time_start_at: string = null;
  time_end_at: string = null;
}
