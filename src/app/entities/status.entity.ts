import { formatStandardTimeStamp } from '../../utils/helper';
export class StatusEntity {
  status_id: number;
  status: string = '';
  type: string = '';
  is_default: string = '';
  position: number = 0;
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
