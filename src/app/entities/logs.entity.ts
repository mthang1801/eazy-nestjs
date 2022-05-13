import { formatStandardTimeStamp } from '../../utils/helper';
export class LogEntity {
  log_id: number = 0;
  status: number = 1;
  module_id: number = null;
  module_name: string = '';
  thread: string = '';
  ref_id: number = null;
  detail: string = '';
  error_code: number = null;
  error_detail: string = '';
  created_at: string = formatStandardTimeStamp();
  method: string = '';
  source_id: number = 0;
  source_name: string = '';
  source_url: string = '';
}
